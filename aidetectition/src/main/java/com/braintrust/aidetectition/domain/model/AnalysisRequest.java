package com.braintrust.aidetectition.domain.model;

import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;

// 📍 aidetection/domain/model/AnalysisRequest.java - AGGREGATE ROOT
public class AnalysisRequest extends AggregateRoot<AnalysisId> {
    private SubmissionId submissionId;
    private String contentToAnalyze;
    private AnalysisStatus status;
    private DetectionResult result;
    private String errorMessage;

    private AnalysisRequest(AnalysisId id, SubmissionId submissionId, String contentToAnalyze) {
        this.id = id;
        this.submissionId = submissionId;
        this.contentToAnalyze = validateContent(contentToAnalyze);
        this.status = AnalysisStatus.PENDING;
    }

    // Factory Method
    public static AnalysisRequest create(SubmissionId submissionId, String contentToAnalyze) {
        AnalysisId id = AnalysisId.generate();
        return new AnalysisRequest(id, submissionId, contentToAnalyze);
    }

    private String validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content to analyze cannot be null or empty");
        }
        return content.trim();
    }

    // Comportamiento de dominio - sin events
    public void completeAnalysis(DetectionResult result) {
        if (this.status != AnalysisStatus.PENDING) {
            throw new IllegalStateException("Only pending analyses can be completed");
        }

        this.result = result;
        this.status = AnalysisStatus.COMPLETED;
    }

    public void markAsFailed(String errorMessage) {
        this.status = AnalysisStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    public boolean isCompleted() {
        return this.status == AnalysisStatus.COMPLETED;
    }

    public boolean isPending() {
        return this.status == AnalysisStatus.PENDING;
    }

    // Getters
    public SubmissionId getSubmissionId() { return submissionId; }
    public String getContentToAnalyze() { return contentToAnalyze; }
    public AnalysisStatus getStatus() { return status; }
    public DetectionResult getResult() { return result; }
    public String getErrorMessage() { return errorMessage; }
}
