package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.Entity;

import java.time.LocalDate;

// 📍 education/domain/model/Enrollment.java - ENTITY
public class Enrollment extends Entity<EnrollmentId> {
    private CourseId courseId;
    private UserId studentId;
    private LocalDate enrollmentDate;
    private EnrollmentStatus status;
    private Grade finalGrade;

    private Enrollment(EnrollmentId id, CourseId courseId, UserId studentId) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.enrollmentDate = LocalDate.now();
        this.status = EnrollmentStatus.ACTIVE;
    }

    public static Enrollment create(CourseId courseId, UserId studentId) {
        EnrollmentId id = EnrollmentId.generate();
        return new Enrollment(id, courseId, studentId);
    }

    // Comportamiento de dominio
    public void complete(Grade finalGrade) {
        if (this.status != EnrollmentStatus.ACTIVE) {
            throw new IllegalStateException("Only active enrollments can be completed");
        }
        this.finalGrade = finalGrade;
        this.status = EnrollmentStatus.COMPLETED;
    }

    public void cancel() {
        if (this.status == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed enrollment");
        }
        this.status = EnrollmentStatus.CANCELLED;
    }

    public boolean isActive() {
        return this.status == EnrollmentStatus.ACTIVE;
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public UserId getStudentId() { return studentId; }
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public EnrollmentStatus getStatus() { return status; }
    public Grade getFinalGrade() { return finalGrade; }
}