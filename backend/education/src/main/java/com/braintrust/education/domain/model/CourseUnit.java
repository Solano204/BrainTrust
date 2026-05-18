package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.shared.domain.Entity;

public class CourseUnit extends Entity<UnitId> {
    private CourseId courseId;
    private String name;
    private String urlImage;
    private int numUnity;
    private String description;

    private CourseUnit(UnitId id, CourseId courseId, String name, int numUnity) {
        this.id = id;
        this.courseId = courseId;
        this.name = validateName(name);
        this.numUnity = validateNumUnity(numUnity);
    }

    public static CourseUnit create(CourseId courseId, String name, int numUnity, String description) {
        UnitId id = UnitId.generate();
        CourseUnit unit = new CourseUnit(id, courseId, name, numUnity);
        unit.description = description;
        unit.urlImage = null;
        return unit;
    }

    public static CourseUnit createWithImage(CourseId courseId, String name, int numUnity,
                                             String description, String urlImage) {
        UnitId id = UnitId.generate();
        CourseUnit unit = new CourseUnit(id, courseId, name, numUnity);
        unit.description = description;
        unit.urlImage = urlImage;
        return unit;
    }

    public static CourseUnit reconstitute(UnitId id, CourseId courseId, String name,
                                          int numUnity, String description, String urlImage) {
        CourseUnit unit = new CourseUnit(id, courseId, name, numUnity);
        unit.description = description;
        unit.urlImage = urlImage;
        return unit;
    }

    public void setUrlImage(String urlImage) {
        if (urlImage != null && urlImage.trim().isEmpty()) {
            throw new IllegalArgumentException("URL image cannot be empty string");
        }
        this.urlImage = urlImage != null ? urlImage.trim() : null;
    }

    public void updateDetails(String name, String description) {
        this.name = validateName(name);
        this.description = description;
    }

    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Unit name cannot be null or empty");
        }
        return name.trim();
    }

    private int validateNumUnity(int numUnity) {
        if (numUnity < 0) {
            throw new IllegalArgumentException("Unit numUnity cannot be negative");
        }
        return numUnity;
    }

    public CourseId getCourseId() { return courseId; }
    public String getName() { return name; }
    public String getUrlImage() { return urlImage; }
    public int getNumUnity() { return numUnity; }
    public String getDescription() { return description; }
}