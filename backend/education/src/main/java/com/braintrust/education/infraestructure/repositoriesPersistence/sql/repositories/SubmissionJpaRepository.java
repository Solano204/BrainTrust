package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionJpaRepository extends JpaRepository<SubmissionJpaEntity, String> {

    List<SubmissionJpaEntity> findByAssignmentId(String assignmentId);
    List<SubmissionJpaEntity> findByStudentId(String studentId);
    List<SubmissionJpaEntity> findByAssignmentIdAndStudentId(String assignmentId, String studentId);
    Optional<SubmissionJpaEntity> findFirstByAssignmentIdAndStudentIdOrderBySubmittedAtDesc(String assignmentId, String studentId);
    List<SubmissionJpaEntity> findByStatus(String status);
    List<SubmissionJpaEntity> findByAssignmentIdAndSubmittedAtAfter(String assignmentId, LocalDateTime dueDate);



    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.id = :id")
    Optional<SubmissionJpaEntity> findByIdWithDocuments(@Param("id") String id);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.assignmentId = :assignmentId")
    List<SubmissionJpaEntity> findByAssignmentIdWithDocuments(@Param("assignmentId") String assignmentId);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.studentId = :studentId")
    List<SubmissionJpaEntity> findByStudentIdWithDocuments(@Param("studentId") String studentId);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.assignmentId = :assignmentId AND s.studentId = :studentId")
    List<SubmissionJpaEntity> findByAssignmentIdAndStudentIdWithDocuments(
            @Param("assignmentId") String assignmentId,
            @Param("studentId") String studentId);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.assignmentId = :assignmentId AND s.studentId = :studentId " +
            "ORDER BY s.submittedAt DESC")
    Optional<SubmissionJpaEntity> findFirstByAssignmentIdAndStudentIdWithDocumentsOrderBySubmittedAtDesc(
            @Param("assignmentId") String assignmentId,
            @Param("studentId") String studentId);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.status = :status")
    List<SubmissionJpaEntity> findByStatusWithDocuments(@Param("status") String status);

    @Query("SELECT DISTINCT s FROM SubmissionJpaEntity s " +
            "LEFT JOIN FETCH s.documents " +
            "WHERE s.assignmentId = :assignmentId AND s.submittedAt > :dueDate")
    List<SubmissionJpaEntity> findByAssignmentIdAndSubmittedAtAfterWithDocuments(
            @Param("assignmentId") String assignmentId,
            @Param("dueDate") LocalDateTime dueDate);



}