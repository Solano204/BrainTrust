package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Score;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// 📍 education/domain/model/Assignment.java - AGGREGATE ROOT
public class Assignment extends AggregateRoot<AssignmentId> {
    private CourseId courseId;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private final List<Document> attachments;
    private LocalDateTime dueDate;
    private Score maxScore;
    private String instructions;
    private final List<Submission> submissions;
    private boolean active;

    private static final int MAX_ATTACHMENTS = 10;

    private Assignment(AssignmentId id, CourseId courseId, String title) {
        this.id = id;
        this.courseId = courseId;
        this.title = validateTitle(title);
        this.createdAt = LocalDateTime.now();
        this.attachments = new ArrayList<>();
        this.submissions = new ArrayList<>();
        this.active = true;
    }

    //  Factory Method for NEW Assignment (without attachments)
    public static Assignment create(CourseId courseId, String title, String description,
                                    LocalDateTime dueDate, int maxPoints, String instructions) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        return assignment;
    }

    //  Factory Method for NEW Assignment (with attachments)
    public static Assignment createWithAttachments(CourseId courseId, String title, String description,
                                                   LocalDateTime dueDate, int maxPoints, String instructions,
                                                   List<Document> attachments) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;

        if (attachments != null && !attachments.isEmpty()) {
            assignment.addAttachments(attachments);
        }

        return assignment;
    }

    // Reconstitute method for EXISTING Assignment (from database)
    public static Assignment reconstitute(AssignmentId id, CourseId courseId, String title,
                                          String description, LocalDateTime createdAt,
                                          List<Document> attachments, LocalDateTime dueDate,
                                          Score maxScore, String instructions,
                                          List<Submission> submissions, boolean active) {
        Assignment assignment = new Assignment(id, courseId, title);
        assignment.description = description;
        assignment.createdAt = createdAt;
        assignment.dueDate = dueDate;
        assignment.maxScore = maxScore;
        assignment.instructions = instructions;
        assignment.active = active;

        if (attachments != null) {
            assignment.attachments.addAll(attachments);
        }
        if (submissions != null) {
            assignment.submissions.addAll(submissions);
        }

        return assignment;
    }

    private String validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Assignment title cannot be null or empty");
        }
        if (title.length() > 255) {
            throw new IllegalArgumentException("Assignment title cannot exceed 255 characters");
        }
        return title.trim();
    }

    public void addAttachment(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Document cannot be null");
        }

        if (attachments.size() >= MAX_ATTACHMENTS) {
            throw new IllegalStateException("Cannot add more than " + MAX_ATTACHMENTS + " attachments");
        }

        attachments.add(document);
    }

    public void addAttachments(List<Document> documents) {
        if (documents == null || documents.isEmpty()) {
            return;
        }

        if (attachments.size() + documents.size() > MAX_ATTACHMENTS) {
            throw new IllegalStateException("Cannot add more than " + MAX_ATTACHMENTS + " attachments in total");
        }

        attachments.addAll(documents);
    }

    public void removeAttachment(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Document cannot be null");
        }

        boolean removed = attachments.remove(document);
        if (!removed) {
            throw new IllegalArgumentException("Document not found in attachments");
        }
    }

    public void clearAttachments() {
        attachments.clear();
    }

    public int getAttachmentCount() {
        return attachments.size();
    }

    public boolean hasAttachments() {
        return !attachments.isEmpty();
    }

    // Comportamiento de dominio - sin events
    public Submission submitWork(UserId studentId, String content, List<Document> submissionAttachments) {
        // Rule 1: If inactive AND past due date -> REJECT
        if (!this.active && dueDate != null && LocalDateTime.now().isAfter(dueDate)) {
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }

        // Rule 2: If inactive BUT before due date -> Still allow (edge case)
        if (!this.active && (dueDate == null || LocalDateTime.now().isBefore(dueDate))) {
        }

        // Determine submission status based on timing and assignment state
        SubmissionStatus status = determineSubmissionStatus();

        // Create submission with appropriate status
        Submission submission = Submission.create(
                this.id,
                studentId,
                content,
                submissionAttachments,
                status
        );

        submissions.add(submission);

        return submission;
    }

    // Helper method to determine submission status
    private SubmissionStatus determineSubmissionStatus() {
        // If active, check if it's past due date
        if (this.active) {
            if (dueDate != null && LocalDateTime.now().isAfter(dueDate)) {
                return SubmissionStatus.LATE_SUBMITTED; // Active but late
            }
            return SubmissionStatus.SUBMITTED; // Active and on time
        }

        // If inactive but before due date (shouldn't normally happen, but handle it)
        if (dueDate == null || LocalDateTime.now().isBefore(dueDate)) {
            return SubmissionStatus.SUBMITTED; // Inactive but on time
        }

        // This shouldn't be reached due to validation above, but just in case
        throw new IllegalStateException("Invalid assignment state for submission");
    }

    public boolean canAcceptSubmissions() {
        // If active = true, always accept submissions (regardless of due date)
        if (active) {
            return true;
        }

        // If active = false, only accept if due date hasn't passed yet
        return dueDate == null || LocalDateTime.now().isBefore(dueDate);
    }

    public void extendDueDate(LocalDateTime newDueDate) {
        if (newDueDate == null || newDueDate.isBefore(createdAt)) {
            throw new IllegalArgumentException("Due date must be after creation date");
        }
        this.dueDate = newDueDate;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }

    public void updateDetails(String title, String description, String instructions) {
        this.title = validateTitle(title);
        this.description = description;
        this.instructions = instructions;
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Document> getAttachments() { return Collections.unmodifiableList(attachments); }
    public LocalDateTime getDueDate() { return dueDate; }
    public Score getMaxScore() { return maxScore; }
    public String getInstructions() { return instructions; }
    public List<Submission> getSubmissions() { return List.copyOf(submissions); }
    public boolean isActive() { return active; }
}