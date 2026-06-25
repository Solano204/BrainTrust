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
import org.springframework.transaction.annotation.Propagation;
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

    private final Semaphore aiServiceRateLimiter = new Semaphore(50);

    public AnalysisApplicationService(
            AnalysisRequestRepository analysisRepository,
            AIDetectionProvider aiDetectionProvider
    ) {
        this.analysisRepository = analysisRepository;
        this.aiDetectionProvider = aiDetectionProvider;

        log.info("AnalysisApplicationService initialized");
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        long startTime = System.currentTimeMillis();

        log.info("AI analysis started submission={} textLength={} model={}",
                submissionId.getValue(),
                command.content() != null ? command.content().length() : 0,
                command.preferredModel());

        validateContent(command.content());

        try {
            List<AnalysisRequest> existing = analysisRepository.findBySubmissionId(submissionId);
            boolean isPending = existing.stream().anyMatch(AnalysisRequest::isPending);

            if (isPending) {
                log.warn("Analysis already in progress for submission={}", submissionId.getValue());
                throw new AnalysisAlreadyExistsException("Analysis already in progress for this submission");
            }

            AnalysisRequest analysisRequest = AnalysisRequest.create(submissionId, command.content());
            AnalysisRequest savedRequest = analysisRepository.save(analysisRequest);

            log.debug("Analysis request persisted id={}, contentLength={}", savedRequest.getId().getValue(), command.content().length());

            ModelType modelType = determineModelType(command.preferredModel());
            log.debug("Using AI model={}", modelType);

            DetectionResult result = callAIServiceWithRateLimit(() ->
                    aiDetectionProvider.analyzeContent(command.content(), modelType)
            );

            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Analysis complete id={} durationMs={} aiProbability={}% model={} likelyAi={}",
                    analysisRequest.getId().getValue(), duration,
                    result.getProbability().getPercentage().setScale(2, RoundingMode.HALF_UP),
                    result.getModelUsed(), result.isLikelyAI());

            return savedRequest.getId();

        } catch (AnalysisAlreadyExistsException e) {
            throw e;

        } catch (Exception e) {
            log.error("Analysis failed for submission={}: {}", submissionId.getValue(), e.getMessage(), e);
            markPendingAnalysesAsFailed(submissionId, e.getMessage());
            throw new RuntimeException("AI text analysis failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        log.info("Cancel requested for analysis={}", analysisId.getValue());

        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (analysisRequest.isCompleted()) {
            log.warn("Cannot cancel completed analysis={}", analysisId.getValue());
            throw new IllegalStateException("Cannot cancel completed analysis");
        }

        if (!analysisRequest.isPending()) {
            log.warn("Cannot cancel analysis={} status={}", analysisId.getValue(), analysisRequest.getStatus());
            throw new IllegalStateException("Only pending analyses can be cancelled");
        }

        analysisRequest.markAsFailed("Cancelled by user");
        analysisRepository.save(analysisRequest);

        log.info("Analysis cancelled id={}", analysisId.getValue());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getAnalysisBySubmission(String submissionId) {
        log.debug("Fetching analysis results for submission={}", submissionId);

        List<AnalysisRequest> analyses = analysisRepository.findBySubmissionId(SubmissionId.fromString(submissionId));

        log.debug("Found {} analysis results for submission={}", analyses.size(), submissionId);

        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

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

    private ModelType determineModelType(String preferredModel) {
        if (preferredModel != null && !preferredModel.trim().isEmpty()) {
            try {
                return ModelType.valueOf(preferredModel.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid model type '{}', defaulting to ENSEMBLE", preferredModel);
            }
        }

        return ModelType.ENSEMBLE;
    }

    private <T> T callAIServiceWithRateLimit(Callable<T> task) throws Exception {
        aiServiceRateLimiter.acquire();
        try {
            return task.call();
        } finally {
            aiServiceRateLimiter.release();
        }
    }

    private AnalysisRequest findAnalysisRequestByIdOrThrow(AnalysisId analysisId) {
        return analysisRepository.findById(analysisId)
                .orElseThrow(() -> {
                    log.warn("Analysis not found id={}", analysisId.getValue());
                    return new AnalysisNotFoundException("Analysis not found: " + analysisId.getValue());
                });
    }

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
                log.info("Marked {} pending analyses as FAILED for submission={}", pendingRequests.size(), submissionId.getValue());
            }

        } catch (Exception e) {
            log.error("Failed to mark pending analyses as failed for submission={}", submissionId.getValue(), e);
        }
    }

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
                            segment.isHighConfidence(),
                            segment.getSegmentType().name()
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
                metadata,
                analysisRequest.getContentToAnalyze()
        );
    }

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