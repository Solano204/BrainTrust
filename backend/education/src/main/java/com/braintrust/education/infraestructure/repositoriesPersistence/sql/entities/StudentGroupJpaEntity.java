package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "student_groups", indexes = {
        @Index(name = "idx_group_course", columnList = "course_id"),
        @Index(name = "idx_group_active", columnList = "active")
})
public class StudentGroupJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_members",
            joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "student_id", length = 50)
    private Set<String> memberIds = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "active", nullable = false)
    private boolean active;

    // Constructors, getters, setters...
    public StudentGroupJpaEntity() {}

    public StudentGroupJpaEntity(String id, String courseId, String name, String description,
                                 Set<String> memberIds, LocalDateTime createdAt, boolean active) {
        this.id = id;
        this.courseId = courseId;
        this.name = name;
        this.description = description;
        if (memberIds != null) this.memberIds = memberIds;
        this.createdAt = createdAt;
        this.active = active;
    }

    // Getters/Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Set<String> getMemberIds() { return memberIds; }
    public void setMemberIds(Set<String> memberIds) { this.memberIds = memberIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}