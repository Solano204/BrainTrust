package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizSubmissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSubmissionJpaRepository extends JpaRepository<QuizSubmissionJpaEntity, String> {

    /*
    List<QuizSubmissionJpaEntity> findByQuizId(String quizId);
    */

    List<QuizSubmissionJpaEntity> findByStudentId(String studentId);

    /*
    List<QuizSubmissionJpaEntity> findByQuizIdAndStudentId(String quizId, String studentId);
    */

    @Query("SELECT qs FROM QuizSubmissionJpaEntity qs " +
            "JOIN QuizJpaEntity q ON qs.quizId = q.id " +
            "WHERE q.courseId = :courseId " +
            "ORDER BY qs.submittedAt DESC NULLS LAST, qs.startedAt DESC")
    List<QuizSubmissionJpaEntity> findByCourseIdOrderBySubmittedAtDesc(@Param("courseId") String courseId);

    // NEW: Find submissions by course and unit
    @Query("SELECT qs FROM QuizSubmissionJpaEntity qs " +
            "JOIN QuizJpaEntity q ON qs.quizId = q.id " +
            "WHERE q.courseId = :courseId AND q.unitId = :unitId " +
            "ORDER BY qs.submittedAt DESC NULLS LAST, qs.startedAt DESC")
    List<QuizSubmissionJpaEntity> findByCourseIdAndUnitIdOrderBySubmittedAtDesc(
            @Param("courseId") String courseId,
            @Param("unitId") String unitId
    );

    // NEW: Find submissions by student, course and unit
    @Query("SELECT qs FROM QuizSubmissionJpaEntity qs " +
            "JOIN QuizJpaEntity q ON qs.quizId = q.id " +
            "WHERE qs.studentId = :studentId AND q.courseId = :courseId AND q.unitId = :unitId " +
            "ORDER BY qs.submittedAt DESC NULLS LAST, qs.startedAt DESC")
    List<QuizSubmissionJpaEntity> findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(
            @Param("studentId") String studentId,
            @Param("courseId") String courseId,
            @Param("unitId") String unitId
    );

    @Query("SELECT s FROM QuizSubmissionJpaEntity s " +
            "WHERE s.quizId = :quizId AND s.studentId = :studentId " +
            "ORDER BY s.attemptNumber DESC LIMIT 1")
    Optional<QuizSubmissionJpaEntity> findLatestByQuizAndStudent(
            @Param("quizId") String quizId,
            @Param("studentId") String studentId
    );

    /*
    List<QuizSubmissionJpaEntity> findByStatus(String status);
    */

    @Query("SELECT COUNT(s) FROM QuizSubmissionJpaEntity s " +
            "WHERE s.quizId = :quizId AND s.studentId = :studentId")
    int countByQuizIdAndStudentId(
            @Param("quizId") String quizId,
            @Param("studentId") String studentId
    );

    /*
    @Query("SELECT qs FROM QuizSubmissionJpaEntity qs " +
            "JOIN QuizJpaEntity q ON qs.quizId = q.id " +
            "WHERE q.courseId = :courseId AND qs.studentId = :studentId")
    List<QuizSubmissionJpaEntity> findByCourseIdAndStudentId(
            @Param("courseId") String courseId,
            @Param("studentId") String studentId);
    */

    /*
    List<QuizSubmissionJpaEntity> findByStudentIdAndStatus(String studentId, String status);
    */
}