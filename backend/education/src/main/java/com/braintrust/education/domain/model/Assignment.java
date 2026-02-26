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
    private UnitId unitId;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private final List<Document> attachments;
    private final List<String> links;
    private LocalDateTime dueDate;
    private Score maxScore;
    private String instructions;
    private final List<Submission> submissions;
    private boolean active;
    private AssignmentTargetType targetType;
    private SubmissionFormat submissionFormat;
    private static final int MAX_ATTACHMENTS = 10;
    private static final int MAX_LINKS = 10;

    private Assignment(AssignmentId id, CourseId courseId, UnitId unitId, String title) {
        this.id = id;
        this.courseId = courseId;
        this.unitId = unitId;
        this.title = validateTitle(title);
        this.createdAt = LocalDateTime.now();
        this.attachments = new ArrayList<>();
        this.links = new ArrayList<>();
        this.submissions = new ArrayList<>();
        this.active = true;
        this.submissionFormat = SubmissionFormat.DIGITAL;
    }

    // ─── Factory Methods ──────────────────────────────────────────────────────

    public static Assignment create(CourseId courseId, UnitId unitId, String title, String description,
                                    LocalDateTime dueDate, int maxPoints, String instructions,
                                    AssignmentTargetType targetType, SubmissionFormat submissionFormat) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        assignment.targetType = targetType;
        assignment.submissionFormat = submissionFormat != null ? submissionFormat : SubmissionFormat.DIGITAL;
        return assignment;
    }

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

    public static Assignment createWithAttachments(CourseId courseId, UnitId unitId, String title,
                                                   String description, LocalDateTime dueDate,
                                                   int maxPoints, String instructions,
                                                   List<Document> attachments,
                                                   AssignmentTargetType targetType) {
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

    public static Assignment createWithLinks(CourseId courseId, UnitId unitId, String title,
                                             String description, LocalDateTime dueDate,
                                             int maxPoints, String instructions,
                                             List<String> links, AssignmentTargetType targetType) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        assignment.targetType = targetType;
        if (links != null && !links.isEmpty()) {
            assignment.addLinks(links);
        }
        return assignment;
    }

    public static Assignment createWithAttachmentsAndLinks(
            CourseId courseId, UnitId unitId, String title, String description,
            LocalDateTime dueDate, int maxPoints, String instructions,
            List<Document> attachments, List<String> links,
            AssignmentTargetType targetType, SubmissionFormat submissionFormat) {
        AssignmentId id = AssignmentId.generate();
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxScore = new Score(maxPoints, maxPoints);
        assignment.instructions = instructions;
        assignment.targetType = targetType;
        assignment.submissionFormat = submissionFormat;
        if (attachments != null && !attachments.isEmpty()) {
            assignment.addAttachments(attachments);
        }
        if (links != null && !links.isEmpty()) {
            assignment.addLinks(links);
        }
        return assignment;
    }

    // Two reconstitute overloads kept for backwards compatibility
    public static Assignment reconstitute(AssignmentId id, CourseId courseId, UnitId unitId, String title,
                                          String description, LocalDateTime createdAt,
                                          List<Document> attachments, List<String> links,
                                          LocalDateTime dueDate, Score maxScore, String instructions,
                                          List<Submission> submissions, boolean active,
                                          AssignmentTargetType targetType,
                                          SubmissionFormat submissionFormat) {
        Assignment assignment = new Assignment(id, courseId, unitId, title);
        assignment.description = description;
        assignment.createdAt = createdAt;
        assignment.dueDate = dueDate;
        assignment.maxScore = maxScore;
        assignment.instructions = instructions;
        assignment.active = active;
        assignment.targetType = targetType;
        assignment.submissionFormat = submissionFormat != null ? submissionFormat : SubmissionFormat.DIGITAL;
        if (attachments != null) assignment.attachments.addAll(attachments);
        if (links != null) assignment.links.addAll(links);
        if (submissions != null) assignment.submissions.addAll(submissions);
        return assignment;
    }

    public static Assignment reconstitute(AssignmentId id, CourseId courseId, UnitId unitId, String title,
                                          String description, LocalDateTime createdAt,
                                          List<Document> attachments, List<String> links,
                                          LocalDateTime dueDate, Score maxScore, String instructions,
                                          List<Submission> submissions, boolean active,
                                          AssignmentTargetType targetType) {
        return reconstitute(id, courseId, unitId, title, description, createdAt,
                attachments, links, dueDate, maxScore, instructions,
                submissions, active, targetType, SubmissionFormat.DIGITAL);
    }

    // ─── Validation ───────────────────────────────────────────────────────────

    private String validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Assignment title cannot be null or empty");
        }
        if (title.length() > 255) {
            throw new IllegalArgumentException("Assignment title cannot exceed 255 characters");
        }
        return title.trim();
    }

    // ─── Attachment Methods ───────────────────────────────────────────────────

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
        if (documents == null || documents.isEmpty()) return;
        if (attachments.size() + documents.size() > MAX_ATTACHMENTS) {
            throw new IllegalStateException("Cannot add more than " + MAX_ATTACHMENTS + " attachments in total");
        }
        attachments.addAll(documents);
    }


    public void removeAttachmentByName(String documentName) {
        if (documentName == null || documentName.trim().isEmpty()) {
            throw new IllegalArgumentException("Document name cannot be null or empty");
        }
        // Just remove if found, don't throw if not found — idempotent
        attachments.removeIf(d -> d.getName().equals(documentName.trim()));
    }
    public void removeAttachment(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Document cannot be null");
        }
        // Try exact match first, then name-only — never throw
        boolean removed = attachments.removeIf(d ->
                d.getName().equals(document.getName()) &&
                        d.getStoragePath().equals(document.getStoragePath())
        );
        if (!removed) {
            attachments.removeIf(d -> d.getName().equals(document.getName()));
        }
    }


    public void clearAttachments() {
        attachments.clear();
    }

    public int getAttachmentCount() { return attachments.size(); }
    public boolean hasAttachments() { return !attachments.isEmpty(); }

    // ─── Link Methods ─────────────────────────────────────────────────────────

    public void addLink(String link) {
        if (link == null || link.trim().isEmpty()) {
            throw new IllegalArgumentException("Link cannot be null or empty");
        }
        if (links.size() >= MAX_LINKS) {
            throw new IllegalStateException("Cannot add more than " + MAX_LINKS + " links");
        }
        String trimmed = link.trim();
        // Prevent duplicates
        if (!links.contains(trimmed)) {
            links.add(trimmed);
        }
    }


    public void addLinks(List<String> newLinks) {
        if (newLinks == null || newLinks.isEmpty()) return;
        if (links.size() + newLinks.size() > MAX_LINKS) {
            throw new IllegalStateException("Cannot add more than " + MAX_LINKS + " links in total");
        }
        for (String link : newLinks) {
            addLink(link);
        }
    }

    public void removeLink(String link) {
        if (link == null) {
            throw new IllegalArgumentException("Link cannot be null");
        }
        String trimmed = link.trim();
        boolean removed = links.remove(trimmed);
        if (!removed) {
            // Try case-insensitive match as fallback
            String found = links.stream()
                    .filter(l -> l.equalsIgnoreCase(trimmed))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Link not found: " + link));
            links.remove(found);
        }
    }

    public void clearLinks() {
        links.clear();
    }

    public int getLinkCount() { return links.size(); }
    public boolean hasLinks() { return !links.isEmpty(); }

    // ─── Business Logic ───────────────────────────────────────────────────────

    public Submission submitWork(UserId studentId, String content, List<Document> submissionAttachments) {
        if (!this.active && dueDate != null && LocalDateTime.now().isAfter(dueDate)) {
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }
        SubmissionStatus status = determineSubmissionStatus();
        Submission submission = Submission.create(this.id, studentId, content, submissionAttachments, status);
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
        return active || dueDate == null || LocalDateTime.now().isBefore(dueDate);
    }

    public void extendDueDate(LocalDateTime newDueDate) {
        if (newDueDate == null || newDueDate.isBefore(createdAt)) {
            throw new IllegalArgumentException("Due date must be after creation date");
        }
        this.dueDate = newDueDate;
    }

    public void deactivate() { this.active = false; }
    public void activate() { this.active = true; }

    public void updateDetails(String title, String description, String instructions) {
        this.title = validateTitle(title);
        this.description = description;
        this.instructions = instructions;
    }

    public void updateDetails(String title, String description, String instructions,
                              SubmissionFormat submissionFormat) {
        this.title = validateTitle(title);
        this.description = description;
        this.instructions = instructions;
        this.submissionFormat = submissionFormat != null ? submissionFormat : SubmissionFormat.DIGITAL;
    }

    public void updateSubmissionFormat(SubmissionFormat submissionFormat) {
        this.submissionFormat = submissionFormat != null ? submissionFormat : SubmissionFormat.DIGITAL;
    }

    public boolean isTeamAssignment() { return targetType == AssignmentTargetType.TEAM; }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public CourseId getCourseId() { return courseId; }
    public UnitId getUnitId() { return unitId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Document> getAttachments() { return Collections.unmodifiableList(attachments); }
    public List<String> getLinks() { return Collections.unmodifiableList(links); }
    public LocalDateTime getDueDate() { return dueDate; }
    public Score getMaxScore() { return maxScore; }
    public String getInstructions() { return instructions; }
    public List<Submission> getSubmissions() { return List.copyOf(submissions); }
    public boolean isActive() { return active; }
    public AssignmentTargetType getTargetType() { return targetType; }
    public SubmissionFormat getSubmissionFormat() { return submissionFormat; }
}