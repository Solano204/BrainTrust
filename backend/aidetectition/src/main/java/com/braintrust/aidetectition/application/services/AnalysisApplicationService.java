package com.braintrust.aidetectition.application.services;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.DetectedSegmentDTO;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.domain.exceptions.AnalysisAlreadyExistsException;
import com.braintrust.aidetectition.domain.exceptions.AnalysisNotFoundException;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnalysisApplicationService implements AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisApplicationService.class);

    private final AnalysisRequestRepository analysisRepository;
    private final AIDetectionProvider aiDetectionProvider;

    // Rate limiter for AI service calls (max 50 concurrent calls)
    private final Semaphore aiServiceRateLimiter = new Semaphore(50);

    public AnalysisApplicationService(
            AnalysisRequestRepository analysisRepository,
            AIDetectionProvider aiDetectionProvider
    ) {
        this.analysisRepository = analysisRepository;
        this.aiDetectionProvider = aiDetectionProvider;

        log.info("✅ AnalysisApplicationService initialized - TEXT ONLY analysis");
    }

    /**
     * ✅ ANALYZE TEXT SUBMISSION - Simplified version
     * Only handles text content analysis, no PDF extraction
     */
    @Override
    public AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Starting text analysis for Submission ID: {}", submissionId.getValue());

        // Validate input
        validateContent(command.content());

        try {
            // ✅ PHASE 1: Check for existing pending analysis
            List<AnalysisRequest> existing = analysisRepository.findBySubmissionId(submissionId);
            boolean isPending = existing.stream().anyMatch(AnalysisRequest::isPending);

            if (isPending) {
                log.warn("❌ Analysis already in progress for Submission ID {}", submissionId.getValue());
                throw new AnalysisAlreadyExistsException("Analysis already in progress for this submission");
            }

            // ✅ PHASE 2: Create and save analysis request
            AnalysisRequest analysisRequest = AnalysisRequest.create(submissionId, command.content());
            AnalysisRequest savedRequest = analysisRepository.save(analysisRequest);

            log.debug("📝 AnalysisRequest saved with ID: {}", savedRequest.getId().getValue());
            log.info("📊 Content length: {} characters", command.content().length());

            // ✅ PHASE 3: Determine model to use
            ModelType modelType = determineModelType(command.preferredModel());
            log.info("🤖 Using AI model: {} for analysis", modelType);

            // ✅ PHASE 4: Call AI service for text analysis
            DetectionResult result = callAIServiceWithRateLimit(() ->
                    aiDetectionProvider.analyzeContent(command.content(), modelType)
            );

            // ✅ PHASE 5: Update analysis with result
            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Analysis {} completed in {}ms. AI Probability: {}%",
                    analysisRequest.getId().getValue(),
                    duration,
                    result.getProbability().getPercentage());

            // Log detailed results
            logAnalysisResult(analysisRequest, result);

            return savedRequest.getId();

        } catch (AnalysisAlreadyExistsException e) {
            // Re-throw domain exceptions
            throw e;

        } catch (Exception e) {
            log.error("❌ Analysis failed for Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);

            // Find and mark any pending analysis as failed
            markPendingAnalysesAsFailed(submissionId, e.getMessage());

            throw new RuntimeException("AI text analysis failed: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ CANCEL PENDING ANALYSIS
     */
    @Override
    public void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        log.warn("🚫 Request to cancel analysis ID: {}", analysisId.getValue());

        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (analysisRequest.isCompleted()) {
            log.warn("❌ Attempted to cancel completed analysis ID: {}", analysisId.getValue());
            throw new IllegalStateException("Cannot cancel completed analysis");
        }

        if (!analysisRequest.isPending()) {
            log.warn("❌ Analysis ID {} is not in PENDING state (current: {})",
                    analysisId.getValue(), analysisRequest.getStatus());
            throw new IllegalStateException("Only pending analyses can be cancelled");
        }

        analysisRequest.markAsFailed("Cancelled by user");
        analysisRepository.save(analysisRequest);

        log.info("✅ Analysis ID {} successfully cancelled", analysisId.getValue());
    }

    /**
     * ✅ GET ANALYSIS BY SUBMISSION
     */
    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getAnalysisBySubmission(String submissionId) {
        log.debug("📊 Fetching analysis results for Submission ID: {}", submissionId);

        List<AnalysisRequest> analyses = analysisRepository.findBySubmissionId(SubmissionId.fromString(submissionId));

        if (analyses.isEmpty()) {
            log.info("No analyses found for Submission ID: {}", submissionId);
        } else {
            log.info("Found {} analysis results for Submission ID: {}",
                    analyses.size(), submissionId);
        }

        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    /**
     * ✅ Validate content before analysis
     */
    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        if (content.length() < 10) {
            throw new IllegalArgumentException("Content must be at least 10 characters");
        }

        if (content.length() > 100000) {
            throw new IllegalArgumentException("Content exceeds maximum length of 100,000 characters");
        }
    }

    /**
     * ✅ Determine which model to use
     */
    private ModelType determineModelType(String preferredModel) {
        if (preferredModel != null && !preferredModel.trim().isEmpty()) {
            try {
                return ModelType.valueOf(preferredModel.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid model type '{}', defaulting to ENSEMBLE", preferredModel);
            }
        }

        // Default to ENSEMBLE model
        return ModelType.ENSEMBLE;
    }

    /**
     * ✅ Call AI service with rate limiting
     */
    private <T> T callAIServiceWithRateLimit(Callable<T> task) throws Exception {
        log.debug("Acquiring AI service rate limiter permit...");
        aiServiceRateLimiter.acquire();

        try {
            log.debug("AI service rate limiter permit acquired. Executing task...");
            return task.call();
        } finally {
            aiServiceRateLimiter.release();
            log.debug("AI service rate limiter permit released.");
        }
    }

    /**
     * ✅ Find analysis request or throw exception
     */
    private AnalysisRequest findAnalysisRequestByIdOrThrow(AnalysisId analysisId) {
        return analysisRepository.findById(analysisId)
                .orElseThrow(() -> {
                    log.warn("❌ Analysis not found for ID: {}", analysisId.getValue());
                    return new AnalysisNotFoundException("Analysis not found: " + analysisId.getValue());
                });
    }

    /**
     * ✅ Mark pending analyses as failed
     */
    private void markPendingAnalysesAsFailed(SubmissionId submissionId, String errorMessage) {
        try {
            List<AnalysisRequest> pendingRequests = analysisRepository.findBySubmissionId(submissionId)
                    .stream()
                    .filter(AnalysisRequest::isPending)
                    .collect(Collectors.toList());

            for (AnalysisRequest request : pendingRequests) {
                request.markAsFailed(errorMessage);
            }

            if (!pendingRequests.isEmpty()) {
                analysisRepository.saveAll(pendingRequests);
                log.info("Marked {} pending analyses as FAILED for Submission ID: {}",
                        pendingRequests.size(), submissionId.getValue());
            }

        } catch (Exception e) {
            log.error("Failed to mark pending analyses as failed", e);
        }
    }

    /**
     * ✅ Log detailed analysis results
     */
    private void logAnalysisResult(AnalysisRequest analysisRequest, DetectionResult result) {
        if (result != null) {
            log.info("📋 Analysis Result Summary:");
            log.info("   - Analysis ID: {}", analysisRequest.getId().getValue());
            log.info("   - AI Probability: {}%",
                    result.getProbability().getPercentage().setScale(2, RoundingMode.HALF_UP));
            log.info("   - Model Used: {}", result.getModelUsed());
            log.info("   - Confidence Level: {}", result.getConfidenceLevel());
            log.info("   - Likely AI: {}", result.isLikelyAI());
            log.info("   - Detected Segments: {}", result.getDetectedSegments().size());

            // Log metadata if available
            if (!result.getMetadata().isEmpty()) {
                log.info("   - Metadata Keys: {}", result.getMetadata().keySet());
            }
        }
    }

    /**
     * ✅ Map domain model to DTO
     */
    private AnalysisResultDTO mapToAnalysisResultDTO(AnalysisRequest analysisRequest) {
        DetectionResult result = analysisRequest.getResult();

        List<DetectedSegmentDTO> segmentDTOs = List.of();
        if (result != null && !result.getDetectedSegments().isEmpty()) {
            segmentDTOs = result.getDetectedSegments().stream()
                    .map(segment -> new DetectedSegmentDTO(
                            segment.getText(),
                            segment.getStartIndex(),
                            segment.getEndIndex(),
                            segment.getAiProbability().toString(),
                            segment.getAiProbability().multiply(new BigDecimal("100"))
                                    .setScale(2, RoundingMode.HALF_UP) + "%",
                            segment.getReason(),
                            segment.isHighConfidence()
                    ))
                    .collect(Collectors.toList());
        }

        Map<String, Object> metadata = result != null ? result.getMetadata() : Map.of();

        return new AnalysisResultDTO(
                analysisRequest.getId().getValue(),
                analysisRequest.getSubmissionId().getValue(),
                result != null ? result.getProbability().getValue().toString() : null,
                result != null ? result.getProbability().getPercentage().toString() + "%" : null,
                result != null ? result.getModelUsed().name() : null,
                result != null ? result.getConfidenceLevel() : null,
                result != null && result.isLikelyAI(),
                result != null && result.getProbability().isUncertain(),
                result != null && result.getProbability().isLikelyHuman(),
                analysisRequest.getStatus().name(),
                analysisRequest.getAnalyzedAt(),
                analysisRequest.getErrorMessage(),
                segmentDTOs,
                metadata
        );
    }

    /**
     * ✅ Get AI service health (optional utility method)
     */
    public Map<String, Object> getServiceHealth() {
        boolean isAvailable = aiDetectionProvider.isServiceAvailable();
        BigDecimal healthScore = aiDetectionProvider.getServiceHealth();
        List<ModelType> availableModels = aiDetectionProvider.getAvailableModels();

        return Map.of(
                "service_available", isAvailable,
                "health_score", healthScore,
                "available_models", availableModels.stream()
                        .map(ModelType::name)
                        .collect(Collectors.toList()),
                "rate_limiter_available_permits", aiServiceRateLimiter.availablePermits(),
                "rate_limiter_queue_length", aiServiceRateLimiter.getQueueLength()
        );
    }

    /**
     * ✅ Get model performance (optional utility method)
     */
    public Map<String, Object> getModelPerformance(String modelName) {
        try {
            ModelType modelType = ModelType.valueOf(modelName.toUpperCase());
            var performance = aiDetectionProvider.getModelPerformance(modelType);

            return Map.of(
                    "model", modelType.name(),
                    "version", performance.getVersion(),
                    "precision", performance.getPrecision(),
                    "recall", performance.getRecall(),
                    "f1_score", performance.getF1Score(),
                    "accuracy", performance.getAccuracy()
            );

        } catch (IllegalArgumentException e) {
            log.warn("Invalid model name: {}", modelName);
            return Map.of("error", "Invalid model name: " + modelName);
        }
    }
}