package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;



@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_document_assignment", columnList = "assignment_id"),
        @Index(name = "idx_document_submission", columnList = "submission_id")
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

    // Foreign keys - one of these will be null
    @Column(name = "assignment_id", length = 50)
    private String assignmentId;

    @Column(name = "submission_id", length = 50)
    private String submissionId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(String assignmentId) {
        this.assignmentId = assignmentId;
    }



    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
// Constructors, getters, setters...
}