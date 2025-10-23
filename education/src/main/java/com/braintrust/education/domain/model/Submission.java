package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;
import com.braintrust.shared.domain.Entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// 📍 education/domain/model/Submission.java - AGGREGATE ROOT
public class Submission extends AggregateRoot<SubmissionId> {
    private AssignmentId assignmentId;
    private UserId studentId;
    private String content;
    private final List<Document> attachments;
    private LocalDateTime submittedAt;
    private SubmissionStatus status;
    private Grade grade;
    private String teacherFeedback;

    private Submission(SubmissionId id, AssignmentId assignmentId, UserId studentId, String content) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.content = validateContent(content);
        this.attachments = new ArrayList<>();
        this.submittedAt = LocalDateTime.now();
        this.status = SubmissionStatus.SUBMITTED;
    }

    // Factory Method
    public static Submission create(AssignmentId assignmentId, UserId studentId,
                                    String content, List<Document> attachments) {
        SubmissionId id = SubmissionId.generate();
        Submission submission = new Submission(id, assignmentId, studentId, content);

        if (attachments != null) {
            submission.attachments.addAll(attachments);
        }

        return submission;
    }

    private String validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Submission content cannot be null or empty");
        }
        return content.trim();
    }

    // Comportamiento de dominio - sin events
    public void grade(Grade grade, String feedback) {
        if (this.status != SubmissionStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted assignments can be graded");
        }

        this.grade = grade;
        this.teacherFeedback = feedback;
        this.status = SubmissionStatus.GRADED;
    }

    public void returnForRevision(String feedback) {
        if (this.status != SubmissionStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted assignments can be returned for revision");
        }

        this.teacherFeedback = feedback;
        this.status = SubmissionStatus.RETURNED;
    }

    public boolean isGraded() {
        return this.status == SubmissionStatus.GRADED;
    }

    public boolean isLate(LocalDateTime dueDate) {
        return dueDate != null && submittedAt.isAfter(dueDate);
    }

    // Método para solicitar análisis IA (será llamado desde el Application Service)
    public void markForAIAnalysis() {
    }

    // Getters
    public AssignmentId getAssignmentId() { return assignmentId; }
    public UserId getStudentId() { return studentId; }
    public String getContent() { return content; }
    public List<Document> getAttachments() { return List.copyOf(attachments); }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public SubmissionStatus getStatus() { return status; }
    public Grade getGrade() { return grade; }
    public String getTeacherFeedback() { return teacherFeedback; }
}
