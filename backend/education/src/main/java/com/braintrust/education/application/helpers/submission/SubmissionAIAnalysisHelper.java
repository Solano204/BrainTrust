package com.braintrust.education.application.helpers.submission;

import com.braintrust.education.application.helpers.plagiarism.SubmissionPlagiarismHelper;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.model.SubmissionFormat;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SubmissionAIAnalysisHelper {

    private static final Logger log = LoggerFactory.getLogger(SubmissionAIAnalysisHelper.class);

    private final AnalysisApplicationService analysisApplicationService;
    private final SubmissionPlagiarismHelper plagiarismHelper;

    @Value("${ai.model-default-type:ENSEMBLE}")
    private String MODEL_IA;

    @Value("${submission.ai-analysis.enabled:true}")
    private boolean aiAnalysisEnabled;

    @Value("${submission.ai-analysis.min-text-length:50}")
    private int minTextLengthForAnalysis;

    public SubmissionAIAnalysisHelper(AnalysisApplicationService analysisApplicationService,
                                      SubmissionPlagiarismHelper plagiarismHelper) {
        this.analysisApplicationService = analysisApplicationService;
        this.plagiarismHelper = plagiarismHelper;
    }

    @Async("virtualTaskExecutor")
    public void triggerAIAnalysisAsync(
            SubmissionId submissionId,
            String extractedText,
            SubmissionFormat submissionFormat) {

        if (!aiAnalysisEnabled) {
            log.info("AI analysis disabled, skipping submission={}", submissionId.getValue());
            return;
        }

        if (submissionFormat != SubmissionFormat.DIGITAL) {
            log.warn("Skipping AI analysis: non-DIGITAL submission={} format={}", submissionId.getValue(), submissionFormat.name());
            return;
        }

        if (extractedText == null || extractedText.trim().isEmpty() ||
                extractedText.length() < minTextLengthForAnalysis) {
            log.warn("Skipping AI analysis: text too short chars={} min={}", extractedText != null ? extractedText.length() : 0, minTextLengthForAnalysis);
            return;
        }

        log.info("Starting async AI analysis submission={} textLength={}", submissionId.getValue(), extractedText.length());
        long startTime = System.currentTimeMillis();

        try {
            analysisApplicationService.analyzeSubmission(
                    new AnalyzeSubmissionCommand(
                            submissionId.getValue(),
                            extractedText,
                            MODEL_IA
                    )
            );

            long duration = System.currentTimeMillis() - startTime;
            log.info("AI analysis completed submission={} durationMs={}", submissionId.getValue(), duration);

            plagiarismHelper.triggerPlagiarismCheckAsync(submissionId, extractedText);

        } catch (Exception e) {
            log.error("AI analysis failed submission={}: {}", submissionId.getValue(), e.getMessage(), e);
        }
    }

    public boolean shouldTriggerAIAnalysis(
            SubmissionFormat format,
            List<Document> documents,
            String extractedText) {
        return format == SubmissionFormat.DIGITAL;
    }

    public void logAIAnalysisSkipReason(
            SubmissionFormat format,
            List<Document> documents,
            String extractedText,
            String submissionType) {
        if (!aiAnalysisEnabled) {
            log.info("AI analysis disabled globally for {} submission", submissionType);
            return;
        }

        if (format != SubmissionFormat.DIGITAL) {
            log.info("Skipping AI analysis for {} submission - format={}", submissionType, format.name());
            return;
        }

        if (documents.isEmpty()) {
            log.info("Skipping AI analysis for {} submission - no documents", submissionType);
            return;
        }

        if (extractedText == null || extractedText.trim().isEmpty()) {
            log.info("Skipping AI analysis for {} submission - no text extracted", submissionType);
            return;
        }

        if (extractedText.length() < minTextLengthForAnalysis) {
            log.info("Skipping AI analysis for {} submission - text too short chars={} min={}",
                    submissionType, extractedText.length(), minTextLengthForAnalysis);
        }
    }

    public AIDetectionResultDTO getAIAnalysisForSubmission(SubmissionId submissionId) {
        List<AnalysisResultDTO> aiAnalyses = analysisApplicationService
                .getAnalysisBySubmission(submissionId.getValue());

        if (aiAnalyses == null || aiAnalyses.isEmpty()) {
            return null;
        }

        return aiAnalyses.stream()
                .filter(analysis -> "COMPLETED".equals(analysis.status()))
                .max((a1, a2) -> {
                    if (a1.analyzedAt() != null && a2.analyzedAt() != null) {
                        return a1.analyzedAt().compareTo(a2.analyzedAt());
                    }
                    return 0;
                })
                .map(analysis -> new AIDetectionResultDTO(
                        analysis.id(),
                        analysis.submissionId(),
                        analysis.probability(),
                        analysis.percentage(),
                        analysis.modelUsed(),
                        analysis.confidenceLevel(),
                        analysis.isLikelyAI(),
                        analysis.isUncertain(),
                        analysis.isLikelyHuman(),
                        analysis.status(),
                        analysis.analyzedAt(),
                        analysis.errorMessage(),
                        analysis.detectedSegments(),
                        analysis.metadata()
                ))
                .orElse(null);
    }
}