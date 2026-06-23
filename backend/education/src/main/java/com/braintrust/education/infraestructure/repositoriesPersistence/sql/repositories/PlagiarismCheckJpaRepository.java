package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.PlagiarismCheckJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlagiarismCheckJpaRepository extends JpaRepository<PlagiarismCheckJpaEntity, String> {

    @Query("SELECT DISTINCT p FROM PlagiarismCheckJpaEntity p " +
            "LEFT JOIN FETCH p.similarParagraphs " +
            "WHERE p.sourceSubmissionId = :submissionId")
    List<PlagiarismCheckJpaEntity> findBySourceSubmissionIdWithParagraphs(
            @Param("submissionId") String submissionId);

    @Query("SELECT DISTINCT p FROM PlagiarismCheckJpaEntity p " +
            "LEFT JOIN FETCH p.similarParagraphs " +
            "WHERE p.assignmentId = :assignmentId")
    List<PlagiarismCheckJpaEntity> findByAssignmentIdWithParagraphs(
            @Param("assignmentId") String assignmentId);

    boolean existsBySourceSubmissionIdAndComparedSubmissionId(
            String sourceSubmissionId, String comparedSubmissionId);

    @Query("SELECT DISTINCT p FROM PlagiarismCheckJpaEntity p " +
            "LEFT JOIN FETCH p.similarParagraphs " +
            "WHERE p.id = :id")
    Optional<PlagiarismCheckJpaEntity> findByIdWithParagraphs(@Param("id") String id);
}
