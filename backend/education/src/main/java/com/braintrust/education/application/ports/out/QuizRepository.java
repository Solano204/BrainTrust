package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface QuizRepository {

    // ── Commands ──────────────────────────────────────────────────────────────
    Quiz save(Quiz quiz);
    void delete(Quiz quiz);

    // ── Queries ───────────────────────────────────────────────────────────────
    Optional<Quiz> findById(QuizId quizId);

    /** NEW — needed by AdminStatsAnalysisService.getTopQuizzesByGrade() */
    List<Quiz> findAll();

    List<Quiz> findByCourseId(CourseId courseId);
    List<Quiz> findBasicQuizzesByCourseId(CourseId courseId);
    List<Quiz> findByCourseIdAndUnitId(CourseId courseId, UnitId unitId);
    List<Quiz> findActiveQuizzesByCourse(CourseId courseId);
    List<Quiz> findAvailableQuizzes(CourseId courseId, LocalDateTime now);

    List<Quiz> findQuizzesByStudentForMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<Quiz> findQuizzesByTeacherForMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<Quiz> findQuizzesByStudentForWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<Quiz> findQuizzesByTeacherForWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);
}