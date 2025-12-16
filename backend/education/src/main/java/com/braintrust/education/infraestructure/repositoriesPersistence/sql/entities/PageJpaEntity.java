package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pages", indexes = {
        @Index(name = "idx_page_course", columnList = "course_id"),
        @Index(name = "idx_page_unit", columnList = "unit_id"),
        @Index(name = "idx_page_published", columnList = "published")
})
public class PageJpaEntity {

    // ✅ Field order should match database column order
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "unit_id", length = 50, nullable = false)
    private String unitId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_modified", nullable = false)
    private LocalDateTime lastModified;

    @Column(name = "published", nullable = false)
    private boolean published;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "page_external_links",
            joinColumns = @JoinColumn(name = "page_id"))
    @Column(name = "url", length = 500)
    private List<String> externalLinks = new ArrayList<>();

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DocumentJpaEntity> attachments = new ArrayList<>();

    // Default constructor
    public PageJpaEntity() {}

    // Constructor matching database column order
    public PageJpaEntity(String id, String courseId, String unitId, String title, String content,
                         LocalDateTime createdAt, LocalDateTime lastModified, boolean published) {
        this.id = id;
        this.courseId = courseId;
        this.unitId = unitId;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.lastModified = lastModified;
        this.published = published;
    }

    // Helper methods
    public void addAttachment(DocumentJpaEntity document) {
        if (document != null) {
            attachments.add(document);
            document.setPage(this);
        }
    }

    public void removeAttachment(DocumentJpaEntity document) {
        if (document != null) {
            attachments.remove(document);
            document.setPage(null);
        }
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public List<String> getExternalLinks() { return externalLinks; }
    public void setExternalLinks(List<String> externalLinks) {
        this.externalLinks = externalLinks != null ? externalLinks : new ArrayList<>();
    }

    public List<DocumentJpaEntity> getAttachments() { return attachments; }
    public void setAttachments(List<DocumentJpaEntity> attachments) {
        if (attachments != null) {
            this.attachments = attachments;
            this.attachments.forEach(doc -> doc.setPage(this));
        }
    }
}