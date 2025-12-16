package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizJpaRepository extends JpaRepository<QuizJpaEntity, String> {

    List<QuizJpaEntity> findByCourseId(String courseId);

    List<QuizJpaEntity> findByCourseIdAndActiveTrue(String courseId);


    List<QuizJpaEntity> findByCourseIdAndUnitId(String courseId, String unitId);

    List<QuizJpaEntity> findByCourseIdAndUnitIdIsNull(String courseId);

    // In QuizJpaRepository interface
    List<QuizJpaEntity> findByCourseIdOrderByCreatedAtDesc(String courseId);

    // Optional: Also add method to get active quizzes ordered by date
    List<QuizJpaEntity> findByCourseIdAndActiveTrueOrderByCreatedAtDesc(String courseId);

    // FIXED: Month calendar queries for quizzes - removed DISTINCT and simplified ORDER BY
    @Query("""
        SELECT q FROM QuizJpaEntity q 
        WHERE q.courseId IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
            AND e.status = 'ACTIVE'
        )
        AND q.active = true
        AND (
            (q.availableFrom BETWEEN :monthStart AND :monthEnd) OR
            (q.availableUntil BETWEEN :monthStart AND :monthEnd) OR
            (q.availableFrom <= :monthStart AND q.availableUntil >= :monthEnd) OR
            (q.availableFrom IS NULL AND q.availableUntil IS NULL)
        )
        ORDER BY q.availableFrom ASC NULLS LAST, q.createdAt ASC
    """)
    List<QuizJpaEntity> findQuizzesByStudentForMonth(
            @Param("studentId") String studentId,
            @Param("monthStart") LocalDateTime monthStart,
            @Param("monthEnd") LocalDateTime monthEnd
    );

    @Query("""
        SELECT q FROM QuizJpaEntity q 
        WHERE q.courseId IN (
            SELECT c.id FROM CourseJpaEntity c 
            WHERE c.teacherId = :teacherId
        )
        AND q.active = true
        AND (
            (q.availableFrom BETWEEN :monthStart AND :monthEnd) OR
            (q.availableUntil BETWEEN :monthStart AND :monthEnd) OR
            (q.availableFrom <= :monthStart AND q.availableUntil >= :monthEnd) OR
            (q.availableFrom IS NULL AND q.availableUntil IS NULL)
        )
        ORDER BY q.availableFrom ASC NULLS LAST, q.createdAt ASC
    """)
    List<QuizJpaEntity> findQuizzesByTeacherForMonth(
            @Param("teacherId") String teacherId,
            @Param("monthStart") LocalDateTime monthStart,
            @Param("monthEnd") LocalDateTime monthEnd
    );

    // FIXED: Week calendar queries for quizzes - removed DISTINCT and simplified ORDER BY
    @Query("""
        SELECT q FROM QuizJpaEntity q 
        WHERE q.courseId IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
            AND e.status = 'ACTIVE'
        )
        AND q.active = true
        AND (
            (q.availableFrom BETWEEN :weekStart AND :weekEnd) OR
            (q.availableUntil BETWEEN :weekStart AND :weekEnd) OR
            (q.availableFrom <= :weekStart AND q.availableUntil >= :weekEnd) OR
            (q.availableFrom IS NULL AND q.availableUntil IS NULL)
        )
        ORDER BY q.availableFrom ASC NULLS LAST, q.createdAt ASC
    """)
    List<QuizJpaEntity> findQuizzesByStudentForWeek(
            @Param("studentId") String studentId,
            @Param("weekStart") LocalDateTime weekStart,
            @Param("weekEnd") LocalDateTime weekEnd
    );

    @Query("""
        SELECT q FROM QuizJpaEntity q 
        WHERE q.courseId IN (
            SELECT c.id FROM CourseJpaEntity c 
            WHERE c.teacherId = :teacherId
        )
        AND q.active = true
        AND (
            (q.availableFrom BETWEEN :weekStart AND :weekEnd) OR
            (q.availableUntil BETWEEN :weekStart AND :weekEnd) OR
            (q.availableFrom <= :weekStart AND q.availableUntil >= :weekEnd) OR
            (q.availableFrom IS NULL AND q.availableUntil IS NULL)
        )
        ORDER BY q.availableFrom ASC NULLS LAST, q.createdAt ASC
    """)
    List<QuizJpaEntity> findQuizzesByTeacherForWeek(
            @Param("teacherId") String teacherId,
            @Param("weekStart") LocalDateTime weekStart,
            @Param("weekEnd") LocalDateTime weekEnd
    );

    @Query("SELECT DISTINCT q FROM QuizJpaEntity q " +
            "LEFT JOIN FETCH q.questions " +
            "WHERE q.id = :quizId")
    Optional<QuizJpaEntity> findByIdWithQuestions(@Param("quizId") String quizId);

    @Query("SELECT q FROM QuizJpaEntity q " +
            "WHERE q.courseId = :courseId " +
            "AND q.active = true " +
            "AND (q.availableFrom IS NULL OR q.availableFrom <= :now) " +
            "AND (q.availableUntil IS NULL OR q.availableUntil >= :now)")
    List<QuizJpaEntity> findAvailableQuizzes(
            @Param("courseId") String courseId,
            @Param("now") LocalDateTime now
    );
}