package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/out/EnrollmentRepository.java
public interface EnrollmentRepository {

    // Commands
    Enrollment save(Enrollment enrollment);
    void delete(Enrollment enrollment);

    // Queries
    Optional<Enrollment> findById(EnrollmentId enrollmentId);
    Optional<Enrollment> findByCourseAndStudent(CourseId courseId, UserId studentId);
    List<Enrollment> findByCourseId(CourseId courseId);
    List<Enrollment> findByStudentId(UserId studentId);
    List<Enrollment> findActiveEnrollments(CourseId courseId);
    boolean existsByCourseAndStudent(CourseId courseId, UserId studentId);
}