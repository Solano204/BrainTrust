package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_links", indexes = {
        @Index(name = "idx_assignment_link_assignment", columnList = "assignment_id")
})
public class AssignmentLinkJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private AssignmentJpaEntity assignment;

    @Column(name = "link_url", length = 1000, nullable = false)
    private String linkUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructor
    public AssignmentLinkJpaEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public AssignmentLinkJpaEntity(AssignmentJpaEntity assignment, String linkUrl) {
        this.assignment = assignment;
        this.linkUrl = linkUrl;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public AssignmentJpaEntity getAssignment() { return assignment; }
    public void setAssignment(AssignmentJpaEntity assignment) { this.assignment = assignment; }

    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}