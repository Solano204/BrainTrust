package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments", indexes = {
        @Index(name = "idx_assignment_course", columnList = "course_id"),
        @Index(name = "idx_assignment_due_date", columnList = "due_date")
})

// VERY POITN IMPORTANT HERE I DONT HAVE THE LIST OF ENTITIIES (" SUBMISSION " ) DUE TO I NEED FOLLOW AND RESPÉCT THE LIMITS OF THE DDD
public class AssignmentJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

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

    // THAT WILL ALLOW ME TO SAVE AUTOMATILCALLY THE DOCUMENTS WHEN I SAVE THE ENTIIY FATHER
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private List<DocumentJpaEntity> documents = new ArrayList<>();


    // Constructors
    public AssignmentJpaEntity() {}

    public AssignmentJpaEntity(String id, String courseId, String title, String description,
                               LocalDateTime createdAt, LocalDateTime dueDate, int maxPoints,
                               String instructions, boolean active) {
        this.id = id;
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.dueDate = dueDate;
        this.maxPoints = maxPoints;
        this.instructions = instructions;
        this.active = active;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

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
    public void setDocuments(List<DocumentJpaEntity> documents) { this.documents = documents; }



}