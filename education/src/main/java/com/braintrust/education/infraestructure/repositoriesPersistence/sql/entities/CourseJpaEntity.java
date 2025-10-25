package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;
        import java.time.LocalDateTime;

@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_course_code", columnList = "code", unique = true),
        @Index(name = "idx_course_teacher", columnList = "teacher_id")
})
public class CourseJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "url_image", length = 500)
    private String urlImage;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "group_name", length = 50)
    private String group;

    @Column(name = "teacher_id", length = 50, nullable = false)
    private String teacherId;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public CourseJpaEntity() {}

    public CourseJpaEntity(String id, String code, String name, String description,
                           String urlImage, String grade, String group, String teacherId,
                           boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.urlImage = urlImage;
        this.grade = grade;
        this.group = group;
        this.teacherId = teacherId;
        this.active = active;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUrlImage() { return urlImage; }
    public void setUrlImage(String urlImage) { this.urlImage = urlImage; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}