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

    Assignment save(Assignment assignment);
    void delete(Assignment assignment);
    Optional<Assignment> findById(AssignmentId assignmentId);

    // ── NEW (required by AdminStatsAnalysisService) ───────────────────────────
    /** Returns every assignment in the system — used by admin stats only. */
    List<Assignment> findAll();

    /** Returns all assignments created by a given teacher — used by admin stats. */
    List<Assignment> findByTeacherId(UserId teacherId);
    // ─────────────────────────────────────────────────────────────────────────

    List<Assignment> findByCourseId(CourseId courseId);
    List<Assignment> findByCourseIdAndUnitId(CourseId courseId, UnitId unitId);
    List<Assignment> findByStudentCourseUnit(UserId studentId, CourseId courseId, UnitId unitId);
    List<Assignment> findActiveAssignmentsByCourse(CourseId courseId);
    List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end);
    List<Assignment> findAssignmentsByStudentForWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<Assignment> findAssignmentsByTeacherForWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<Assignment> findAssignmentsByStudentForMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<Assignment> findAssignmentsByTeacherForMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd);
}