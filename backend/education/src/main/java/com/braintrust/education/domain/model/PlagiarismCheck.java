package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PlagiarismCheck extends AggregateRoot<PlagiarismCheckId> {

    private SubmissionId sourceSubmissionId;
    private SubmissionId comparedSubmissionId;
    private UserId comparedStudentId;
    private AssignmentId assignmentId;
    private BigDecimal overallSimilarity;
    private List<SimilarParagraph> similarParagraphs;
    private PlagiarismStatus status;
    private String errorMessage;
    private LocalDateTime checkedAt;

    private PlagiarismCheck(PlagiarismCheckId id, SubmissionId sourceSubmissionId,
                            SubmissionId comparedSubmissionId, UserId comparedStudentId,
                            AssignmentId assignmentId) {
        this.id = id;
        this.sourceSubmissionId = sourceSubmissionId;
        this.comparedSubmissionId = comparedSubmissionId;
        this.comparedStudentId = comparedStudentId;
        this.assignmentId = assignmentId;
        this.similarParagraphs = new ArrayList<>();
        this.status = PlagiarismStatus.PENDING;
    }

    public static PlagiarismCheck create(SubmissionId sourceSubmissionId,
                                         SubmissionId comparedSubmissionId,
                                         UserId comparedStudentId,
                                         AssignmentId assignmentId) {
        return new PlagiarismCheck(
                PlagiarismCheckId.generate(),
                sourceSubmissionId, comparedSubmissionId,
                comparedStudentId, assignmentId
        );
    }

    public static PlagiarismCheck reconstitute(PlagiarismCheckId id,
                                               SubmissionId sourceSubmissionId,
                                               SubmissionId comparedSubmissionId,
                                               UserId comparedStudentId,
                                               AssignmentId assignmentId,
                                               BigDecimal overallSimilarity,
                                               List<SimilarParagraph> similarParagraphs,
                                               PlagiarismStatus status,
                                               String errorMessage,
                                               LocalDateTime checkedAt) {
        PlagiarismCheck check = new PlagiarismCheck(id, sourceSubmissionId, comparedSubmissionId,
                comparedStudentId, assignmentId);
        check.overallSimilarity = overallSimilarity;
        check.similarParagraphs = similarParagraphs != null ? new ArrayList<>(similarParagraphs) : new ArrayList<>();
        check.status = status;
        check.errorMessage = errorMessage;
        check.checkedAt = checkedAt;
        return check;
    }

    public void complete(BigDecimal overallSimilarity, List<SimilarParagraph> paragraphs) {
        this.overallSimilarity = overallSimilarity;
        this.similarParagraphs = paragraphs != null ? new ArrayList<>(paragraphs) : new ArrayList<>();
        this.status = PlagiarismStatus.COMPLETED;
        this.checkedAt = LocalDateTime.now();
    }

    public void fail(String errorMessage) {
        this.status = PlagiarismStatus.FAILED;
        this.errorMessage = errorMessage;
        this.checkedAt = LocalDateTime.now();
    }

    public boolean isCompleted() { return status == PlagiarismStatus.COMPLETED; }

    public SubmissionId getSourceSubmissionId() { return sourceSubmissionId; }
    public SubmissionId getComparedSubmissionId() { return comparedSubmissionId; }
    public UserId getComparedStudentId() { return comparedStudentId; }
    public AssignmentId getAssignmentId() { return assignmentId; }
    public BigDecimal getOverallSimilarity() { return overallSimilarity; }
    public List<SimilarParagraph> getSimilarParagraphs() { return List.copyOf(similarParagraphs); }
    public PlagiarismStatus getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getCheckedAt() { return checkedAt; }
}
