package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/out/AssignmentRepository.java
public interface AssignmentRepository {

    // Commands
    Assignment save(Assignment assignment);
    void delete(Assignment assignment);

    // Queries
    Optional<Assignment> findById(AssignmentId assignmentId);
    List<Assignment> findByCourseId(CourseId courseId);
    List<Assignment> findActiveAssignmentsByCourse(CourseId courseId);
    List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end);
}