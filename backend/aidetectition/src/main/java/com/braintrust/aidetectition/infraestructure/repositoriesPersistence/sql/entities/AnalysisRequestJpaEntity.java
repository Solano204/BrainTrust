package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_requests", indexes = {
        @Index(name = "idx_analysis_submission", columnList = "submission_id"),
        @Index(name = "idx_analysis_status", columnList = "status"),
        @Index(name = "idx_analysis_probability", columnList = "probability")
})
public class AnalysisRequestJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "submission_id", length = 50, nullable = false)
    private String submissionId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "probability", precision = 10, scale = 4)
    private BigDecimal probability;

    @Column(name = "model_used", length = 50)
    private String modelUsed;

    @Column(name = "confidence_level", length = 20)
    private String confidenceLevel;

    @Column(name = "detected_segments_json", columnDefinition = "jsonb")
    private String detectedSegmentsJson;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    // Constructors
    public AnalysisRequestJpaEntity() {}

    public AnalysisRequestJpaEntity(String id, String submissionId, String contentToAnalyze,
                                    String status, BigDecimal probability, String modelUsed,
                                    String confidenceLevel, String detectedSegmentsJson,
                                    String errorMessage, LocalDateTime createdAt, LocalDateTime analyzedAt) {
        this.id = id;
        this.submissionId = submissionId;
        this.content = contentToAnalyze;
        this.status = status;
        this.probability = probability;
        this.modelUsed = modelUsed;
        this.confidenceLevel = confidenceLevel;
        this.detectedSegmentsJson = detectedSegmentsJson;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
        this.analyzedAt = analyzedAt;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }

    public String getContentToAnalyze() { return content; }
    public void setContentToAnalyze(String contentToAnalyze) { this.content = contentToAnalyze; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getProbability() { return probability; }
    public void setProbability(BigDecimal probability) { this.probability = probability; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public String getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(String confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public String getDetectedSegmentsJson() { return detectedSegmentsJson; }
    public void setDetectedSegmentsJson(String detectedSegmentsJson) { this.detectedSegmentsJson = detectedSegmentsJson; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}