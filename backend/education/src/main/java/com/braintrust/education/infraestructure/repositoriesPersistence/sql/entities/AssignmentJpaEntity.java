package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "assignments", indexes = {
        @Index(name = "idx_assignment_course", columnList = "course_id"),
        @Index(name = "idx_assignment_unit", columnList = "unit_id"),
        @Index(name = "idx_assignment_due_date", columnList = "due_date"),
        @Index(name = "idx_assignment_target_type", columnList = "target_type"),
        @Index(name = "idx_submission_format", columnList = "submission_format")
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
    private String submissionFormat = "DIGITAL";

//    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
//    private List<DocumentJpaEntity> documents = new ArrayList<>();

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<AssignmentLinkJpaEntity> links = new HashSet<>();



    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<DocumentJpaEntity> documents = new LinkedHashSet<>();


    @Column(name = "target_type", length = 20, nullable = false)
    private String targetType = "INDIVIDUAL";

    public AssignmentJpaEntity() {}

    public AssignmentJpaEntity(String id, String courseId, String unit, String title,
                               String description, LocalDateTime createdAt, LocalDateTime dueDate,
                               int maxPoints, String instructions, boolean active,
                               String targetType, String submissionFormat) {
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

    //  Document helpers 

    public void addDocument(DocumentJpaEntity document) {
        documents.add(document);
        document.setAssignment(this);
    }

    public void removeDocument(DocumentJpaEntity document) {
        // Set.remove() uses equals() which needs id  safer to match by name+path
        documents.removeIf(d ->
                d.getName().equals(document.getName()) &&
                        d.getStoragePath().equals(document.getStoragePath())
        );
        document.setAssignment(null);
    }

    public void removeAttachmentByName(String name) {
        this.documents.removeIf(d -> d.getName().equals(name));
    }
    // AssignmentJpaEntity.java  replace syncDocuments



    // AssignmentJpaEntity.java  replace syncDocuments entirely
    public void syncDocuments(List<String[]> desiredNameAndPath) {

        // Deduplicate by name  keep only first occurrence of each name
        Map<String, String> desiredMap = new LinkedHashMap<>(); // name -> storagePath
        for (String[] pair : desiredNameAndPath) {
            desiredMap.putIfAbsent(pair[0], pair[1]); // pair[0]=name, pair[1]=path
        }

        // Remove documents whose NAME is not in desired set
        List<DocumentJpaEntity> toRemove = new ArrayList<>(documents);
        toRemove.removeIf(d -> desiredMap.containsKey(d.getName()));
        for (DocumentJpaEntity d : toRemove) {
            documents.removeIf(doc ->
                    doc.getName().equals(d.getName()) &&
                            doc.getStoragePath().equals(d.getStoragePath())
            );
            d.setAssignment(null);
        }

        // Add documents whose name is not yet present
        Set<String> currentNames = documents.stream()
                .map(DocumentJpaEntity::getName)
                .collect(Collectors.toSet());

        for (Map.Entry<String, String> entry : desiredMap.entrySet()) {
            if (!currentNames.contains(entry.getKey())) {
                DocumentJpaEntity newDoc = new DocumentJpaEntity();
                newDoc.setName(entry.getKey());
                newDoc.setStoragePath(entry.getValue());
                addDocument(newDoc);
            }
        }
    }


    /**
     * Syncs the links collection to exactly match the desired URL set.
     * Mutates the SAME collection instance so Hibernate tracks every change.
     */
    public void syncLinks(List<String> desiredUrls) {
        Set<String> desiredSet = new HashSet<>(desiredUrls);

        // Remove links not in desired set
        links.removeIf(l -> !desiredSet.contains(l.getLinkUrl()));

        // Build set of URLs still present
        Set<String> currentUrls = links.stream()
                .map(AssignmentLinkJpaEntity::getLinkUrl)
                .collect(Collectors.toSet());

        // Add new links
        for (String url : desiredUrls) {
            if (!currentUrls.contains(url)) {
                links.add(new AssignmentLinkJpaEntity(this, url));
            }
        }
    }

    //  Legacy link helpers (kept for compatibility) 

    public void addLink(String linkUrl) {
        if (linkUrl != null && !linkUrl.trim().isEmpty()) {
            links.add(new AssignmentLinkJpaEntity(this, linkUrl.trim()));
        }
    }

    public void addLinks(List<String> linkUrls) {
        if (linkUrls != null) {
            linkUrls.forEach(this::addLink);
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

    public List<String> getLinkUrls() {
        return links.stream()
                .map(AssignmentLinkJpaEntity::getLinkUrl)
                .collect(Collectors.toList());
    }

    //  Getters / Setters 

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

    public String getSubmissionFormat() { return submissionFormat; }
    public void setSubmissionFormat(String submissionFormat) {
        this.submissionFormat = submissionFormat != null ? submissionFormat : "DIGITAL";
    }

    // Getter returns List (converts Set -> List)
    public List<DocumentJpaEntity> getDocuments() {
        return new ArrayList<>(documents);
    }

    // Setter accepts List (converts List -> Set)
    public void setDocuments(List<DocumentJpaEntity> documents) {
        this.documents = documents != null
                ? new LinkedHashSet<>(documents)
                : new LinkedHashSet<>();
        this.documents.forEach(d -> d.setAssignment(this));
    }

    public Set<AssignmentLinkJpaEntity> getLinks() { return links; }
    public void setLinks(Set<AssignmentLinkJpaEntity> links) {
        this.links = links;
        if (links != null) {
            links.forEach(l -> l.setAssignment(this));
        }
    }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) {
        this.targetType = targetType != null ? targetType : "INDIVIDUAL";
    }
}