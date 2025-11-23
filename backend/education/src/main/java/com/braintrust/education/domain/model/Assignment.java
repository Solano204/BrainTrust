package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Assignment extends AggregateRoot<AssignmentId> {
    private CourseId courseId;
    private UnitId unitId; // ✅ Now properly linked to a unit
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private final List<Document> attachments;
    private LocalDateTime dueDate;
    private Score maxScore;
    private String instructions;
    private final List<Submission> submissions;
    private boolean active;
    private AssignmentTargetType targetType;
    private static final int MAX_ATTACHMENTS = 10;

    private Assignment(AssignmentId id, CourseId courseId, UnitId unitId, String title) {
        this.id = id;
        this.courseId = courseId;
        this.unitId = unitId; // ✅ UnitId is now required in constructor
        this.title = validateTitle(title);
        this.createdAt = LocalDateTime.now();
        this.attachments = new ArrayList<>();
        this.submissions = new ArrayList<>();
        this.active = true;
    }

    // ✅ Factory Method for INDIVIDUAL Assignment with Unit
    public static Assignment createForIndividual(CourseId courseId, UnitId unitId, String title,
                                                 String description, LocalDateTime dueDate,
                                                 int maxPoints, String instructions) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.targetType = AssignmentTargetType.INDIVIDUAL;
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        return assignment;
    }

    // ✅ Factory Method for TEAM Assignment with Unit
    public static Assignment createForTeam(CourseId courseId, UnitId unitId, String title,
                                           String description, LocalDateTime dueDate,
                                           int maxPoints, String instructions) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.targetType = AssignmentTargetType.TEAM;
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        return assignment;
    }

    // ✅ Factory Method with target type selection and Unit
    public static Assignment create(CourseId courseId, UnitId unitId, String title, String description,
                                    LocalDateTime dueDate, int maxPoints, String instructions,
                                    AssignmentTargetType targetType) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        assignment.targetType = targetType;
        return assignment;
    }




    // ✅ Factory Method with attachments, target type and Unit
    public static Assignment createWithAttachments(CourseId courseId, UnitId unitId, String title, String description,
                                                   LocalDateTime dueDate, int maxPoints, String instructions,
                                                   List<Document> attachments, AssignmentTargetType targetType) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        assignment.targetType = targetType;

        if (attachments != null && !attachments.isEmpty()) {
            assignment.addAttachments(attachments);
        }

        return assignment;
    }

    // ✅ RECONSTITUTE METHOD - UnitId is now properly handled
    public static Assignment reconstitute(AssignmentId id, CourseId courseId, UnitId unitId, String title,
                                          String description, LocalDateTime createdAt,
                                          List<Document> attachments, LocalDateTime dueDate,
                                          Score maxScore, String instructions,
                                          List<Submission> submissions, boolean active,
                                          AssignmentTargetType targetType) {
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.createdAt = createdAt;
        assignment.dueDate = dueDate;
        assignment.maxScore = maxScore;
        assignment.instructions = instructions;
        assignment.active = active;
        assignment.targetType = targetType;

        if (attachments != null) {
            assignment.attachments.addAll(attachments);
        }
        if (submissions != null) {
            assignment.submissions.addAll(submissions);
        }
        return assignment;
    }

    // ... (rest of your methods remain the same, just ensure they use the unitId)

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

    public Submission submitWork(UserId studentId, String content, List<Document> submissionAttachments) {
        if (!this.active && dueDate != null && LocalDateTime.now().isAfter(dueDate)) {
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }

        if (!this.active && (dueDate == null || LocalDateTime.now().isBefore(dueDate))) {
            // Allow submission but assignment remains inactive
        }

        SubmissionStatus status = determineSubmissionStatus();

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

    private SubmissionStatus determineSubmissionStatus() {
        if (this.active) {
            if (dueDate != null && LocalDateTime.now().isAfter(dueDate)) {
                return SubmissionStatus.LATE_SUBMITTED;
            }
            return SubmissionStatus.SUBMITTED;
        }

        if (dueDate == null || LocalDateTime.now().isBefore(dueDate)) {
            return SubmissionStatus.SUBMITTED;
        }

        throw new IllegalStateException("Invalid assignment state for submission");
    }

    public boolean canAcceptSubmissions() {
        if (active) {
            return true;
        }

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

    public boolean isTeamAssignment() {
        return targetType == AssignmentTargetType.TEAM;
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public UnitId getUnitId() { return unitId; } // ✅ UnitId getter
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Document> getAttachments() { return Collections.unmodifiableList(attachments); }
    public LocalDateTime getDueDate() { return dueDate; }
    public Score getMaxScore() { return maxScore; }
    public String getInstructions() { return instructions; }
    public List<Submission> getSubmissions() { return List.copyOf(submissions); }
    public boolean isActive() { return active; }
    public AssignmentTargetType getTargetType() { return targetType; }
}