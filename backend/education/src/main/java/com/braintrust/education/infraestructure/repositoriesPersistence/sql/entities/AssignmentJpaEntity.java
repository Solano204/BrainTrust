package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "assignments", indexes = {
        @Index(name = "idx_assignment_course", columnList = "course_id"),
        @Index(name = "idx_assignment_unit", columnList = "unit_id"),
        @Index(name = "idx_assignment_due_date", columnList = "due_date"),
        @Index(name = "idx_assignment_target_type", columnList = "target_type"),
        @Index(name = "idx_submission_format", columnList = "submission_format") // ✅ NEW index
})
public class AssignmentJpaEntity {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "unit_id", length = 50)
    private String unit;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "max_points", nullable = false)
    private int maxPoints;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "submission_format", length = 20, nullable = false)
    private String submissionFormat = "DIGITAL"; // ✅ NEW: Submission format column


    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DocumentJpaEntity> documents = new ArrayList<>();

    // ✅ CHANGE: Use Set instead of List for links to avoid MultipleBagFetchException
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<AssignmentLinkJpaEntity> links = new HashSet<>();

    @Column(name = "target_type", length = 20, nullable = false)
    private String targetType = "INDIVIDUAL";

    public AssignmentJpaEntity() {}

    public AssignmentJpaEntity(String id, String courseId, String unit, String title,
                               String description, LocalDateTime createdAt, LocalDateTime dueDate,
                               int maxPoints, String instructions, boolean active,
                               String targetType, String submissionFormat) { // ✅ NEW parameter
        this.id = id;
        this.courseId = courseId;
        this.unit = unit;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.dueDate = dueDate;
        this.maxPoints = maxPoints;
        this.instructions = instructions;
        this.active = active;
        this.targetType = targetType != null ? targetType : "INDIVIDUAL";
        this.submissionFormat = submissionFormat != null ? submissionFormat : "DIGITAL";
    }


    // Add getter and setter
    public String getSubmissionFormat() { return submissionFormat; }
    public void setSubmissionFormat(String submissionFormat) {
        this.submissionFormat = submissionFormat != null ? submissionFormat : "DIGITAL";
    }


    // Helper method to add document
    public void addDocument(DocumentJpaEntity document) {
        documents.add(document);
        document.setAssignment(this);
    }

    public void removeDocument(DocumentJpaEntity document) {
        documents.remove(document);
        document.setAssignment(null);
    }

    // ✅ UPDATED - Link management methods
    public void addLink(String linkUrl) {
        if (linkUrl != null && !linkUrl.trim().isEmpty()) {
            AssignmentLinkJpaEntity link = new AssignmentLinkJpaEntity(this, linkUrl.trim());
            links.add(link);
        }
    }

    public void addLinks(List<String> linkUrls) {
        if (linkUrls != null && !linkUrls.isEmpty()) {
            for (String linkUrl : linkUrls) {
                if (linkUrl != null && !linkUrl.trim().isEmpty()) {
                    AssignmentLinkJpaEntity link = new AssignmentLinkJpaEntity(this, linkUrl.trim());
                    links.add(link);
                }
            }
        }
    }

    public void removeLink(String linkUrl) {
        if (linkUrl != null) {
            links.removeIf(link -> link.getLinkUrl().equals(linkUrl.trim()));
        }
    }

    public void clearLinks() {
        links.clear();
    }

    // Helper method to get link URLs
    public List<String> getLinkUrls() {
        return links.stream()
                .map(AssignmentLinkJpaEntity::getLinkUrl)
                .collect(Collectors.toList());
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public int getMaxPoints() { return maxPoints; }
    public void setMaxPoints(int maxPoints) { this.maxPoints = maxPoints; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<DocumentJpaEntity> getDocuments() { return documents; }
    public void setDocuments(List<DocumentJpaEntity> documents) {
        this.documents = documents;
        // Set the bidirectional relationship
        if (documents != null) {
            for (DocumentJpaEntity document : documents) {
                document.setAssignment(this);
            }
        }
    }

    // ✅ UPDATED - Links getter and setter (now returns Set)
    public Set<AssignmentLinkJpaEntity> getLinks() { return links; }
    public void setLinks(Set<AssignmentLinkJpaEntity> links) {
        this.links = links;
        // Set the bidirectional relationship
        if (links != null) {
            for (AssignmentLinkJpaEntity link : links) {
                link.setAssignment(this);
            }
        }
    }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) {
        this.targetType = targetType != null ? targetType : "INDIVIDUAL";
    }
}