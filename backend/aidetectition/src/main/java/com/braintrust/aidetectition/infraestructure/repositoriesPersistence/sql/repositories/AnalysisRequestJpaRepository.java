package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisRequestJpaRepository extends JpaRepository<AnalysisRequestJpaEntity, String> {

    List<AnalysisRequestJpaEntity> findBySubmissionId(String submissionId);
    List<AnalysisRequestJpaEntity> findByStatus(String status);
    List<AnalysisRequestJpaEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<AnalysisRequestJpaEntity> findByProbabilityGreaterThan(BigDecimal threshold);
}