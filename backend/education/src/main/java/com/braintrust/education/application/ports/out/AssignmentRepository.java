package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AssignmentRepository {

    // Commands
    Assignment save(Assignment assignment);
    void delete(Assignment assignment);

    // Queries
    Optional<Assignment> findById(AssignmentId assignmentId);
    List<Assignment> findByCourseId(CourseId courseId);

    // NEW: Find assignments by course and unit
    List<Assignment> findByCourseIdAndUnitId(CourseId courseId, UnitId unitId);

    List<Assignment> findActiveAssignmentsByCourse(CourseId courseId);
    List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end);

    // Week calendar queries
    List<Assignment> findAssignmentsByStudentForWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<Assignment> findAssignmentsByTeacherForWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);

    // NEW: Month calendar queries
    List<Assignment> findAssignmentsByStudentForMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<Assignment> findAssignmentsByTeacherForMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd);
}