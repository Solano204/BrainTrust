package com.braintrust.education.application.helpers.plagiarism;

import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.education.application.ports.out.PlagiarismCheckRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.model.PlagiarismCheck;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SubmissionPlagiarismHelper {

    private static final Logger log = LoggerFactory.getLogger(SubmissionPlagiarismHelper.class);

    private final SubmissionRepository submissionRepository;
    private final PlagiarismCheckRepository plagiarismCheckRepository;
    private final TextSimilarityEngine similarityEngine;
    private final AnalysisApplicationService analysisService;

    @Value("${plagiarism.enabled:true}")
    private boolean plagiarismEnabled;

    @Value("${plagiarism.high-similarity-threshold:70.0}")
    private double highSimilarityThreshold;

    @Value("${submission.content.empty-placeholder:Submitted with attachments}")
    private String emptyPlaceholder;

    public SubmissionPlagiarismHelper(SubmissionRepository submissionRepository,
                                      PlagiarismCheckRepository plagiarismCheckRepository,
                                      TextSimilarityEngine similarityEngine,
                                      AnalysisApplicationService analysisService) {
        this.submissionRepository = submissionRepository;
        this.plagiarismCheckRepository = plagiarismCheckRepository;
        this.similarityEngine = similarityEngine;
        this.analysisService = analysisService;
    }

    @Async("virtualTaskExecutor")
    public void triggerPlagiarismCheckAsync(SubmissionId submissionId, String extractedText) {
        if (!plagiarismEnabled) {
            log.info("Plagiarism check disabled, skipping submission={}", submissionId.getValue());
            return;
        }

        if (extractedText == null || extractedText.isBlank()) {
            log.info("Plagiarism check skipped: no text for submission={}", submissionId.getValue());
            return;
        }

        long startTime = System.currentTimeMillis();
        log.info("Starting async plagiarism check submission={}", submissionId.getValue());

        try {
            Submission source = submissionRepository.findById(submissionId).orElse(null);
            if (source == null) {
                log.warn("Plagiarism check aborted: submission not found id={}", submissionId.getValue());
                return;
            }

            AssignmentId assignmentId = source.getAssignmentId();
            List<Submission> peers = submissionRepository.findByAssignmentId(assignmentId);

            List<PlagiarismCheck> checks = new ArrayList<>();

            for (Submission peer : peers) {
                if (peer.getId().getValue().equals(submissionId.getValue())) continue;
                if (plagiarismCheckRepository.existsBySourceAndCompared(submissionId, peer.getId())) continue;

                String peerText = resolveTextForSubmission(peer);
                if (peerText == null || peerText.isBlank()) {
                    log.debug("Skipping peer={}: no usable text", peer.getId().getValue());
                    continue;
                }

                try {
                    PlagiarismCheck check = PlagiarismCheck.create(
                            submissionId, peer.getId(), peer.getStudentId(), assignmentId);

                    TextSimilarityEngine.PlagiarismAnalysis analysis =
                            similarityEngine.analyze(extractedText, peerText);

                    check.complete(analysis.overallSimilarity(), analysis.similarParagraphs());

                    if (analysis.overallSimilarity().doubleValue() >= highSimilarityThreshold) {
                        log.warn("High similarity detected submission={} comparedTo={} similarity={}%",
                                submissionId.getValue(), peer.getId().getValue(), analysis.overallSimilarity());
                    }

                    checks.add(check);
                } catch (Exception e) {
                    log.error("Plagiarism comparison failed submission={} peer={}: {}",
                            submissionId.getValue(), peer.getId().getValue(), e.getMessage());
                }
            }

            if (!checks.isEmpty()) {
                plagiarismCheckRepository.saveAll(checks);
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Plagiarism check complete submission={} peersChecked={} durationMs={}",
                    submissionId.getValue(), checks.size(), duration);

        } catch (Exception e) {
            log.error("Plagiarism check failed submission={}: {}", submissionId.getValue(), e.getMessage(), e);
        }
    }

    // Get the best available text for a submission:
    // 1. Try the extracted text stored in the completed AI analysis (handles PDF submissions).
    // 2. Fall back to submission.content only if it's real text (not the placeholder).
    private String resolveTextForSubmission(Submission submission) {
        try {
            List<AnalysisResultDTO> analyses = analysisService
                    .getAnalysisBySubmission(submission.getId().getValue());

            String analysisText = analyses.stream()
                    .filter(a -> "COMPLETED".equals(a.status()))
                    .filter(a -> a.contentToAnalyze() != null && !a.contentToAnalyze().isBlank())
                    .findFirst()
                    .map(AnalysisResultDTO::contentToAnalyze)
                    .orElse(null);

            if (analysisText != null) return analysisText;
        } catch (Exception e) {
            log.debug("Could not fetch analysis text for peer={}: {}", submission.getId().getValue(), e.getMessage());
        }

        String content = submission.getContent();
        if (content != null && !content.isBlank() && !content.equals(emptyPlaceholder)) {
            return content;
        }

        return null;
    }
}
