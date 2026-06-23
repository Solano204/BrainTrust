package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plagiarism_checks", indexes = {
        @Index(name = "idx_plagiarism_source", columnList = "source_submission_id"),
        @Index(name = "idx_plagiarism_assignment", columnList = "assignment_id"),
        @Index(name = "idx_plagiarism_compared", columnList = "compared_submission_id")
})
public class PlagiarismCheckJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "source_submission_id", length = 50, nullable = false)
    private String sourceSubmissionId;

    @Column(name = "compared_submission_id", length = 50, nullable = false)
    private String comparedSubmissionId;

    @Column(name = "compared_student_id", length = 50, nullable = false)
    private String comparedStudentId;

    @Column(name = "assignment_id", length = 50, nullable = false)
    private String assignmentId;

    @Column(name = "overall_similarity", precision = 5, scale = 2)
    private BigDecimal overallSimilarity;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    @OneToMany(mappedBy = "plagiarismCheck", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SimilarParagraphJpaEntity> similarParagraphs = new ArrayList<>();

    public PlagiarismCheckJpaEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourceSubmissionId() { return sourceSubmissionId; }
    public void setSourceSubmissionId(String sourceSubmissionId) { this.sourceSubmissionId = sourceSubmissionId; }

    public String getComparedSubmissionId() { return comparedSubmissionId; }
    public void setComparedSubmissionId(String comparedSubmissionId) { this.comparedSubmissionId = comparedSubmissionId; }

    public String getComparedStudentId() { return comparedStudentId; }
    public void setComparedStudentId(String comparedStudentId) { this.comparedStudentId = comparedStudentId; }

    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }

    public BigDecimal getOverallSimilarity() { return overallSimilarity; }
    public void setOverallSimilarity(BigDecimal overallSimilarity) { this.overallSimilarity = overallSimilarity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }

    public List<SimilarParagraphJpaEntity> getSimilarParagraphs() { return similarParagraphs; }
    public void setSimilarParagraphs(List<SimilarParagraphJpaEntity> similarParagraphs) {
        this.similarParagraphs = similarParagraphs;
    }
}
