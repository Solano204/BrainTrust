package com.braintrust.aidetectition.application.services;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtosResponse.*;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.exceptions.AnalysisAlreadyExistsException;
import com.braintrust.aidetectition.domain.exceptions.AnalysisNotFoundException;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class AnalysisApplicationService implements AnalysisService {

    private final AnalysisRequestRepository analysisRepository;
    private final AIDetectionProvider aiDetectionProvider;


    @Value("${document.storage.strategy:before}")  // Options: before, after, parallel
    private String storageStrategy;

    public AnalysisApplicationService(
            AnalysisRequestRepository analysisRepository,
            AIDetectionProvider aiDetectionProvider,
            DocumentStorageService documentStorageService
    ) {
        this.analysisRepository = analysisRepository;
        this.aiDetectionProvider = aiDetectionProvider;
    }

    @Override
    public AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        log.info("Starting text analysis for Submission ID: {}", submissionId.getValue());

        // 1. Fetch ALL existing analyses for this submission (returns List<AnalysisRequest>)
        List<AnalysisRequest> existing = analysisRepository.findBySubmissionId(submissionId);

        // 2. Check if ANY request in the list is already pending (CRITICAL FIX)
        boolean isPending = existing.stream().anyMatch(AnalysisRequest::isPending);

        if (isPending) {
            log.warn("Analysis already in progress for Submission ID {}. Rejecting new request.", submissionId.getValue());
            throw new AnalysisAlreadyExistsException("Analysis already in progress for this submission");
        }

        // 3. Proceed with new analysis creation
        AnalysisRequest analysisRequest = AnalysisRequest.create(submissionId, command.content());
        AnalysisRequest savedRequest = analysisRepository.save(analysisRequest);
        log.debug("New AnalysisRequest saved with ID: {}", savedRequest.getId().getValue());

        try {
            ModelType modelType = command.preferredModel() != null
                    ? ModelType.valueOf(command.preferredModel())
                    : ModelType.ENSEMBLE;

            log.info("Dispatching content to AI Provider using model: {}", modelType);

            DetectionResult result = aiDetectionProvider.analyzeContent(command.content(), modelType);

            // 4. Update and save the request
            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);
            log.info("Analysis ID {} completed successfully. Probability: {}",
                    analysisRequest.getId().getValue(), result.getProbability().getPercentage());

        } catch (Exception e) {
            log.error("Analysis ID {} failed during processing", analysisRequest.getId().getValue(), e);
            analysisRequest.markAsFailed("Analysis failed: " + e.getMessage());
            analysisRepository.save(analysisRequest);
        }

        return savedRequest.getId();
    }

    @Override
    public List<AnalysisId> analyzePdfSubmission(AnalyzePdfSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        log.info("📄 Starting batch PDF analysis for Submission ID: {} with {} files",
                submissionId.getValue(), command.pdfFiles().size());

        // Check if analysis already in progress
        // 📍 Assuming the repository method now returns List<AnalysisRequest>
        List<AnalysisRequest> existing = analysisRepository.findBySubmissionId(submissionId);

// Check if ANY of the existing requests for this Submission ID are currently in PENDING status.
        boolean isPending = existing.stream()
                .anyMatch(AnalysisRequest::isPending);

        if (isPending) {
            log.warn("Analysis already in progress for Submission ID {}. Rejecting new request.", submissionId.getValue());
            throw new AnalysisAlreadyExistsException("Analysis already in progress for this submission");
        }

        // 1. Create analysis requests for all files
        List<AnalysisRequest> analysisRequests = command.pdfFiles().stream()
                .map(pdfFile -> AnalysisRequest.create(
                        submissionId,
                        "PDF file: " + pdfFile.getOriginalFilename()
                ))
                .collect(Collectors.toList());

        // Save all at once (batch operation) - Now they are PENDING in the DB
        analysisRequests = analysisRepository.saveAll(analysisRequests);
        List<AnalysisId> analysisIds = new ArrayList<>();

        // 2. CRITICAL: Wrap external API call and result processing
        try {
            log.debug("Dispatching {} files for external AI analysis...", analysisRequests.size());

            // Analyze all PDF files at once
            List<DetectionResult> results = aiDetectionProvider.analyzePdfFile(
                    command.pdfFiles(),
                    ModelType.valueOf(command.preferredModel())
            );

            // 3. Match results with requests and complete them
            for (int i = 0; i < Math.min(analysisRequests.size(), results.size()); i++) {
                AnalysisRequest request = analysisRequests.get(i);
                DetectionResult result = results.get(i);

                request.completeAnalysis(result);
                analysisIds.add(request.getId());
            }

            // 4. Save all completed analyses
            analysisRepository.saveAll(analysisRequests);
            log.info("✅ Batch PDF Analysis completed. Successfully processed {} files.", analysisIds.size());

        } catch (Exception e) {
            log.error("❌ Batch PDF Analysis FAILED due to external service error. Marking requests as failed.", e);

            // 5. ERROR HANDLING: Mark ALL pending requests as failed and save
            String errorMessage = "Batch analysis failed: " + e.getMessage();

            for (AnalysisRequest request : analysisRequests) {
                // Only update requests that haven't been completed yet (though ideally, none would be)
                if (request.isPending()) {
                    request.markAsFailed(errorMessage);
                }
            }
            analysisRepository.saveAll(analysisRequests);

            // Re-throw a domain-specific exception to be caught by the GlobalExceptionHandler
            throw new RuntimeException("AI Detection service failed to process PDF files.", e);
        }

        return analysisIds;
    }


    @Override
    public void retryAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        log.info("Attempting to retry analysis for ID: {}", analysisId.getValue());
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (!analysisRequest.getStatus().equals(AnalysisStatus.FAILED)) {
            log.warn("Cannot retry analysis ID {} because status is {}",
                    analysisId.getValue(), analysisRequest.getStatus());
            throw new IllegalStateException("Only failed analyses can be retried");
        }

        try {
            DetectionResult result = aiDetectionProvider.analyzeContent(
                    analysisRequest.getContentToAnalyze(),
                    ModelType.ENSEMBLE
            );

            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);
            log.info("Analysis ID {} successfully retried and completed", analysisId.getValue());

        } catch (Exception e) {
            log.error("Retry for Analysis ID {} failed", analysisId.getValue(), e);
            analysisRequest.markAsFailed("Retry failed: " + e.getMessage());
            analysisRepository.save(analysisRequest);
        }
    }

    @Override
    public void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        log.warn("Request to cancel analysis ID: {}", analysisId.getValue());
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (analysisRequest.isCompleted()) {
            log.warn("Attempted to cancel completed analysis ID: {}", analysisId.getValue());
            throw new IllegalStateException("Cannot cancel completed analysis");
        }

        analysisRequest.markAsFailed("Cancelled by user");
        analysisRepository.save(analysisRequest);
        log.info("Analysis ID {} marked as cancelled", analysisId.getValue());
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisResultDTO getAnalysisResult(AnalysisId analysisId) {
        log.debug("Fetching detailed result for Analysis ID: {}", analysisId.getValue());
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);
        return mapToAnalysisResultDTO(analysisRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getAnalysisBySubmission(SubmissionId submissionId) {
        log.debug("Fetching analysis by Submission ID: {}", submissionId.getValue());

        // 1. Fetch the list of domain objects from the repository
        List<AnalysisRequest> analyses = analysisRepository.findBySubmissionId(submissionId);

        // 2. Stream the list, map each domain object to its DTO counterpart, and collect the results.
        return analyses.stream()
                .map(this::mapToAnalysisResultDTO) // Use the existing helper method
                .collect(Collectors.toList());      // Collect into the required List<AnalysisResultDTO>
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getAnalysesByStatus(AnalysisStatus status) {
        log.debug("Fetching analyses with status: {}", status.name());
        List<AnalysisRequest> analyses = analysisRepository.findByStatus(status);
        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getPendingAnalyses() {
        log.debug("Fetching all PENDING analyses");
        List<AnalysisRequest> analyses = analysisRepository.findPendingAnalyses();
        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisStatisticsDTO getAnalysisStatistics(LocalDateTime start, LocalDateTime end) {
        log.debug("Calculating statistics for period: {} to {}", start, end);
        List<AnalysisRequest> analyses = analysisRepository.findByDateRange(start, end);
        int total = analyses.size();

        int completed = (int) analyses.stream()
                .filter(AnalysisRequest::isCompleted)
                .count();
        int failed = (int) analyses.stream()
                .filter(a -> a.getStatus() == AnalysisStatus.FAILED)
                .count();
        int pending = (int) analyses.stream()
                .filter(AnalysisRequest::isPending)
                .count();

        Map<ModelType, Integer> modelUsageMap = analyses.stream()
                .filter(AnalysisRequest::isCompleted)
                .collect(Collectors.groupingBy(
                        a -> a.getResult().getModelUsed(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        ModelUsageStatsDTO modelUsage = new ModelUsageStatsDTO(
                modelUsageMap.getOrDefault(ModelType.GPT_DETECTOR, 0),
                modelUsageMap.getOrDefault(ModelType.BERT_CLASSIFIER, 0),
                modelUsageMap.getOrDefault(ModelType.ENSEMBLE, 0)
        );

        int high = (int) analyses.stream()
                .filter(AnalysisRequest::isCompleted)
                .filter(a -> a.getResult().getProbability().isLikelyAI())
                .count();

        int low = (int) analyses.stream()
                .filter(AnalysisRequest::isCompleted)
                .filter(a -> a.getResult().getProbability().isLikelyHuman())
                .count();

        int medium = completed - high - low;

        ConfidenceDistributionDTO confidenceDist = new ConfidenceDistributionDTO(high, medium, low);

        log.debug("Statistics calculated: Total={}, Completed={}, Failed={}", total, completed, failed);

        return new AnalysisStatisticsDTO(
                start.toString(),
                end.toString(),
                total,
                completed,
                failed,
                pending,
                "0.5",
                modelUsage,
                confidenceDist,
                high,
                medium,
                low
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetectionSummaryDTO> getHighRiskSubmissions(BigDecimal threshold) {
        log.debug("Fetching submissions with probability above threshold: {}", threshold);
        List<AnalysisRequest> analyses = analysisRepository.findByProbabilityAbove(threshold);

        return analyses.stream()
                .filter(AnalysisRequest::isCompleted)
                .map(analysis -> new DetectionSummaryDTO(
                        analysis.getSubmissionId().getValue(),
                        "Student Name",
                        "Assignment Title",
                        "Course Name",
                        analysis.getResult().getProbability().getValue().toString(),
                        analysis.getResult().getProbability().isLikelyAI(),
                        analysis.getAnalyzedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    private AnalysisRequest findAnalysisRequestByIdOrThrow(AnalysisId analysisId) {
        log.trace("Searching for Analysis ID: {}", analysisId.getValue());
        return analysisRepository.findById(analysisId)
                .orElseThrow(() -> {
                    log.warn("Analysis not found for ID: {}", analysisId.getValue());
                    return new AnalysisNotFoundException("Analysis not found: " + analysisId.getValue());
                });
    }

    private ModelType getModelType(String preferredModel) {
        return preferredModel != null ? ModelType.valueOf(preferredModel) : ModelType.ENSEMBLE;
    }

    private AnalysisResultDTO mapToAnalysisResultDTO(AnalysisRequest analysisRequest) {
        DetectionResult result = analysisRequest.getResult();

        log.trace("Mapping AnalysisRequest {} to DTO", analysisRequest.getId().getValue());

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
}