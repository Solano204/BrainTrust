package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
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
}