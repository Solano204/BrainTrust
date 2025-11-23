package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;

import java.time.LocalDateTime;
import java.util.*;

// 📍 education/domain/model/Course.java - AGGREGATE ROOT
public class Course extends AggregateRoot<CourseId> {
    private CourseCode code;
    private String name;
    private String description;
    private String urlImage;
    private String grade;
    private String group;
    private UserId teacherId;
    private boolean active;
    private final Set<Enrollment> enrollments;
    private final List<CourseUnit> units;

    private Course(CourseId id, CourseCode code, String name, UserId teacherId) {
        this.id = id;
        this.code = code;
        this.name = validateName(name);
        this.teacherId = teacherId;
        this.active = true;
        this.enrollments = new HashSet<>();
        this.units = new ArrayList<>();
    }

    //  Factory Method for NEW Course (without image)
    public static Course create(CourseCode code, String name, String description,
                                String grade, String group, UserId teacherId) {
        CourseId courseId = CourseId.generate();
        Course course = new Course(courseId, code, name, teacherId);
        course.description = description;
        course.grade = grade;
        course.group = group;
        course.urlImage = null; // Can be set later
        return course;
    }

    // Factory Method for NEW Course (with image)
    public static Course createWithImage(CourseCode code, String name, String description,
                                         String grade, String group, UserId teacherId, String urlImage) {
        CourseId courseId = CourseId.generate();
        Course course = new Course(courseId, code, name, teacherId);
        course.description = description;
        course.grade = grade;
        course.group = group;
        course.urlImage = urlImage;
        return course;
    }

    public static Course reconstitute(CourseId id, CourseCode code, String name, String description,
                                      String urlImage, String grade, String group, UserId teacherId,
                                      boolean active, Set<Enrollment> enrollments, List<CourseUnit> units) {
        Course course = new Course(id, code, name, teacherId);
        course.description = description;
        course.urlImage = urlImage;
        course.grade = grade;
        course.group = group;
        course.active = active;

        if (enrollments != null) {
            course.enrollments.addAll(enrollments);
        }
        if (units != null) {
            course.units.addAll(units);
        }

        return course;
    }

    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Course name cannot be null or empty");
        }
        if (name.length() > 255) {
            throw new IllegalArgumentException("Course name cannot exceed 255 characters");
        }
        return name.trim();
    }

    public void setUrlImage(String urlImage) {
        if (urlImage != null && urlImage.trim().isEmpty()) {
            throw new IllegalArgumentException("URL image cannot be empty string");
        }
        this.urlImage = urlImage != null ? urlImage.trim() : null;
    }

    public void updateDetails(String name, String description, String grade, String group) {
        this.name = validateName(name);
        this.description = description;
        this.grade = grade;
        this.group = group;
    }


    public boolean removeUnit(UnitId unitId) {
        boolean removed = units.removeIf(unit -> unit.getId().equals(unitId));

        return removed;
    }


    public Enrollment enrollStudent(UserId studentId) {
        if (!this.active) {
            throw new IllegalStateException("Cannot enroll students in inactive course");
        }

        boolean alreadyEnrolled = enrollments.stream()
                .anyMatch(enrollment -> enrollment.getStudentId().equals(studentId));

        if (alreadyEnrolled) {
            throw new IllegalArgumentException("Student is already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.create(this.id, studentId);
        enrollments.add(enrollment);

        return enrollment;
    }

    public void unenrollStudent(UserId studentId) {
        Enrollment enrollment = findEnrollment(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student is not enrolled in this course"));

        enrollment.cancel();
        enrollments.remove(enrollment);
    }



    public CourseUnit addUnit(String name, int order, String description) {
        CourseUnit unit = CourseUnit.create(this.id, name, order, description);
        units.add(unit);
        return unit;
    }

    public CourseUnit addUnitWithImage(String name, int order, String description, String urlImage) {
        CourseUnit unit = CourseUnit.createWithImage(this.id, name, order, description, urlImage);
        units.add(unit);
        return unit;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }

    private Optional<Enrollment> findEnrollment(UserId studentId) {
        return enrollments.stream()
                .filter(enrollment -> enrollment.getStudentId().equals(studentId))
                .findFirst();
    }

    // Getters
    public CourseCode getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getUrlImage() { return urlImage; }
    public String getGrade() { return grade; }
    public String getGroup() { return group; }
    public UserId getTeacherId() { return teacherId; }
    public boolean isActive() { return active; }
    public Set<Enrollment> getEnrollments() { return Set.copyOf(enrollments); }
    public List<CourseUnit> getUnits() { return List.copyOf(units); }
}