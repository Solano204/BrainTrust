package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


public class Submission extends AggregateRoot<SubmissionId> {
    private AssignmentId assignmentId;
    private UserId studentId;
    private String content;
    private StudentGroupId teamId; // null if individual
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
    private Submission(SubmissionId id, AssignmentId assignmentId, UserId studentId, String content,StudentGroupId teamId) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.content = validateContent(content);
        this.attachments = new ArrayList<>();
        this.submittedAt = LocalDateTime.now();
        this.status = SubmissionStatus.SUBMITTED;
        this.teamId = teamId;
    }

    private Submission(SubmissionId id, AssignmentId assignmentId, UserId studentId, String content,SubmissionStatus status) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.content = validateContent(content);
        this.attachments = new ArrayList<>();
        this.submittedAt = LocalDateTime.now();
        this.status = status;
    }

    public static Submission create(AssignmentId assignmentId, UserId studentId,
                                    String content, List<Document> attachments,
                                    SubmissionStatus status, StudentGroupId teamId) {
        SubmissionId id = SubmissionId.generate();
        Submission submission = new Submission(id, assignmentId, studentId, content, teamId);

        if (attachments != null) {
            submission.attachments.addAll(attachments);
        }
        submission.status = status;

        return submission;
    }


    public static Submission create(AssignmentId assignmentId, UserId studentId,
                                    String content, List<Document> attachments,
                                    SubmissionStatus status) {
        return create(assignmentId, studentId, content, attachments, status, null);
    }


    private String validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Submission content cannot be null or empty");
        }
        return content.trim();
    }


    public static Submission reconstitute(SubmissionId id, AssignmentId assignmentId,
                                          UserId studentId, String content,
                                          List<Document> attachments, LocalDateTime submittedAt,
                                          SubmissionStatus status, Grade grade,
                                          String teacherFeedback) {
        Submission submission = new Submission(id, assignmentId, studentId, content);

        submission.submittedAt = submittedAt;
        submission.status = status;
        submission.grade = grade;
        submission.teacherFeedback = teacherFeedback;

        if (attachments != null) {
            submission.attachments.addAll(attachments);
        }

        return submission;
    }
    public static Submission reconstitute(SubmissionId id, AssignmentId assignmentId,
                                          UserId studentId, String content,
                                          List<Document> attachments, LocalDateTime submittedAt,
                                          SubmissionStatus status, Grade grade,
                                          String teacherFeedback,StudentGroupId teamId) {
        Submission submission = new Submission(id, assignmentId, studentId, content);

        submission.submittedAt = submittedAt;
        submission.status = status;
        submission.grade = grade;
        submission.teamId= teamId;
        submission.teacherFeedback = teacherFeedback;

        if (attachments != null) {
            submission.attachments.addAll(attachments);
        }

        return submission;
    }


    public void grade(Grade grade, String feedback) {
        if (this.status != SubmissionStatus.SUBMITTED) {
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

    // Mtodo para solicitar anlisis IA (ser llamado desde el Application Service)
    public void markForAIAnalysis() {
    }

    public AssignmentId getAssignmentId() { return assignmentId; }
    public UserId getStudentId() { return studentId; }
    public String getContent() { return content; }
    public List<Document> getAttachments() { return List.copyOf(attachments); }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public SubmissionStatus getStatus() { return status; }
    public Grade getGrade() { return grade; }
    public String getTeacherFeedback() { return teacherFeedback; }
    public StudentGroupId getTeamId() { return teamId; }

}
