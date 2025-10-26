package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "course_units", indexes = {
        @Index(name = "idx_unit_course", columnList = "course_id"),
        @Index(name = "idx_unit_number", columnList = "num_unity")
})
public class CourseUnitJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "url_image", length = 500)
    private String urlImage;

    @Column(name = "num_unity", nullable = false)
    private int numUnity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Constructors
    public CourseUnitJpaEntity() {}

    public CourseUnitJpaEntity(String id, String courseId, String name,
                               String urlImage, int numUnity, String description) {
        this.id = id;
        this.courseId = courseId;
        this.name = name;
        this.urlImage = urlImage;
        this.numUnity = numUnity;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrlImage() { return urlImage; }
    public void setUrlImage(String urlImage) { this.urlImage = urlImage; }

    public int getNumUnity() { return numUnity; }
    public void setNumUnity(int numUnity) { this.numUnity = numUnity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}