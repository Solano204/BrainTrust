package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_document_assignment", columnList = "assignment_id"),
        @Index(name = "idx_document_submission", columnList = "submission_id"),
        @Index(name = "idx_document_page", columnList = "page_id")
})
public class DocumentJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private AssignmentJpaEntity assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private SubmissionJpaEntity submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private PageJpaEntity page;

    public DocumentJpaEntity() {}


    public DocumentJpaEntity(String name, String storagePath, AssignmentJpaEntity assignment) {
        this.name = name;
        this.storagePath = storagePath;
        this.assignment = assignment;
        this.submission = null;
        this.page = null;
    }

    public DocumentJpaEntity(String name, String storagePath, SubmissionJpaEntity submission) {
        this.name = name;
        this.storagePath = storagePath;
        this.submission = submission;
        this.assignment = null;
        this.page = null;
    }

    public DocumentJpaEntity(String name, String storagePath, PageJpaEntity page) {
        this.name = name;
        this.storagePath = storagePath;
        this.page = page;
        this.assignment = null;
        this.submission = null;
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public AssignmentJpaEntity getAssignment() { return assignment; }
    public void setAssignment(AssignmentJpaEntity assignment) { this.assignment = assignment; }

    public SubmissionJpaEntity getSubmission() { return submission; }
    public void setSubmission(SubmissionJpaEntity submission) { this.submission = submission; }

    public PageJpaEntity getPage() { return page; }
    public void setPage(PageJpaEntity page) { this.page = page; }

    // DocumentJpaEntity.java  add these two methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DocumentJpaEntity)) return false;
        DocumentJpaEntity that = (DocumentJpaEntity) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}