package com.braintrust.aidetectition.domain.model;

import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;

public class AnalysisRequest extends AggregateRoot<AnalysisId> {
    private SubmissionId submissionId;
    private String contentToAnalyze;
    private AnalysisStatus status;
    private DetectionResult result;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime analyzedAt;

    private AnalysisRequest(AnalysisId id, SubmissionId submissionId, String contentToAnalyze) {
        this.id = id;
        this.submissionId = submissionId;
        this.contentToAnalyze = validateContent(contentToAnalyze);
        this.status = AnalysisStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public static AnalysisRequest create(SubmissionId submissionId, String contentToAnalyze) {
        AnalysisId id = AnalysisId.generate();
        return new AnalysisRequest(id, submissionId, contentToAnalyze);
    }

    public static AnalysisRequest reconstitute(AnalysisId id, SubmissionId submissionId,
                                               String contentToAnalyze, AnalysisStatus status,
                                               DetectionResult result, String errorMessage,
                                               LocalDateTime createdAt, LocalDateTime analyzedAt) {
        AnalysisRequest analysis = new AnalysisRequest(id, submissionId, contentToAnalyze);
        analysis.status = status;
        analysis.result = result;
        analysis.errorMessage = errorMessage;
        analysis.createdAt = createdAt;
        analysis.analyzedAt = analyzedAt;
        return analysis;
    }

    private String validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content to analyze cannot be null or empty");
        }
        return content.trim();
    }

    public void completeAnalysis(DetectionResult result) {
        if (result == null) {
            throw new IllegalArgumentException("Detection result cannot be null");
        }
        if (this.status != AnalysisStatus.PENDING) {
            throw new IllegalStateException("Only pending analyses can be completed");
        }

        this.result = result;
        this.status = AnalysisStatus.COMPLETED;
        this.analyzedAt = LocalDateTime.now();
    }

    public void markAsFailed(String errorMessage) {
        this.status = AnalysisStatus.FAILED;
        this.errorMessage = errorMessage;
        this.analyzedAt = LocalDateTime.now();
    }

    public boolean isCompleted() {
        return this.status == AnalysisStatus.COMPLETED;
    }

    public boolean isPending() {
        return this.status == AnalysisStatus.PENDING;
    }

    public SubmissionId getSubmissionId() { return submissionId; }
    public String getContentToAnalyze() { return contentToAnalyze; }
    public AnalysisStatus getStatus() { return status; }
    public DetectionResult getResult() { return result; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
}