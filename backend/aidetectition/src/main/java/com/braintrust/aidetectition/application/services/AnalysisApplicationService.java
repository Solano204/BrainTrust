package com.braintrust.aidetectition.application.services;

// 📍 aidetection/application/services/AnalysisApplicationService.java
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtos.*;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.domain.exceptions.AnalysisAlreadyExistsException;
import com.braintrust.aidetectition.domain.exceptions.AnalysisNotFoundException;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnalysisApplicationService implements AnalysisService {

    private final AnalysisRequestRepository analysisRepository;
    private final AIDetectionProvider aiDetectionProvider;

    public AnalysisApplicationService(
            AnalysisRequestRepository analysisRepository,
            AIDetectionProvider aiDetectionProvider
    ) {
        this.analysisRepository = analysisRepository;
        this.aiDetectionProvider = aiDetectionProvider;
    }

    @Override
    public AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        Optional<AnalysisRequest> existing = analysisRepository.findBySubmissionId(submissionId);
        if (existing.isPresent() && existing.get().isPending()) {
            throw new AnalysisAlreadyExistsException("Analysis already in progress for this submission");
        }

        AnalysisRequest analysisRequest = AnalysisRequest.create(submissionId, command.content());
        AnalysisRequest savedRequest = analysisRepository.save(analysisRequest);

        try {
            ModelType modelType = command.preferredModel() != null
                    ? ModelType.valueOf(command.preferredModel())
                    : ModelType.ENSEMBLE;

            DetectionResult result = aiDetectionProvider.analyzeContent(command.content(), modelType);

            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);

        } catch (Exception e) {
            analysisRequest.markAsFailed("Analysis failed: " + e.getMessage());
            analysisRepository.save(analysisRequest);
        }

        return savedRequest.getId();
    }

    @Override
    public void retryAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (!analysisRequest.getStatus().equals(AnalysisStatus.FAILED)) {
            throw new IllegalStateException("Only failed analyses can be retried");
        }

        try {
            DetectionResult result = aiDetectionProvider.analyzeContent(
                    analysisRequest.getContentToAnalyze(),
                    ModelType.ENSEMBLE
            );

            analysisRequest.completeAnalysis(result);
            analysisRepository.save(analysisRequest);

        } catch (Exception e) {
            analysisRequest.markAsFailed("Retry failed: " + e.getMessage());
            analysisRepository.save(analysisRequest);
        }
    }

    @Override
    public void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException {
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);

        if (analysisRequest.isCompleted()) {
            throw new IllegalStateException("Cannot cancel completed analysis");
        }

        analysisRequest.markAsFailed("Cancelled by user");
        analysisRepository.save(analysisRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisResultDTO getAnalysisResult(AnalysisId analysisId) {
        AnalysisRequest analysisRequest = findAnalysisRequestByIdOrThrow(analysisId);
        return mapToAnalysisResultDTO(analysisRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AnalysisResultDTO> getAnalysisBySubmission(SubmissionId submissionId) {
        return analysisRepository.findBySubmissionId(submissionId)
                .map(this::mapToAnalysisResultDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getAnalysesByStatus(AnalysisStatus status) {
        List<AnalysisRequest> analyses = analysisRepository.findByStatus(status);
        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResultDTO> getPendingAnalyses() {
        List<AnalysisRequest> analyses = analysisRepository.findPendingAnalyses();
        return analyses.stream()
                .map(this::mapToAnalysisResultDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisStatisticsDTO getAnalysisStatistics(LocalDateTime start, LocalDateTime end) {
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

    // ✅ PRIVATE HELPER METHODS

    private AnalysisRequest findAnalysisRequestByIdOrThrow(AnalysisId analysisId) {
        return analysisRepository.findById(analysisId)
                .orElseThrow(() -> new AnalysisNotFoundException("Analysis not found: " + analysisId.getValue()));
    }

    private AnalysisResultDTO mapToAnalysisResultDTO(AnalysisRequest analysisRequest) {
        DetectionResult result = analysisRequest.getResult();

        // ✅ Map detected segments
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
                segmentDTOs, // ✅ Include detected segments
                metadata
        );
    }
}