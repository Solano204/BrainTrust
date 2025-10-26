package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper.AnalysisEntityMapper;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaAnalysisRequestRepositoryAdapter implements AnalysisRequestRepository {

    private final AnalysisRequestJpaRepository jpaRepository;
    private final AnalysisEntityMapper mapper;

    public JpaAnalysisRequestRepositoryAdapter(
            AnalysisRequestJpaRepository jpaRepository,
            AnalysisEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public AnalysisRequest save(AnalysisRequest analysisRequest) throws JsonProcessingException {
        AnalysisRequestJpaEntity entity = mapper.toEntity(analysisRequest);
        AnalysisRequestJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(AnalysisRequest analysisRequest) {
        jpaRepository.deleteById(analysisRequest.getId().getValue());
    }

    @Override
    public Optional<AnalysisRequest> findById(AnalysisId analysisId) {
        return jpaRepository.findById(analysisId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<AnalysisRequest> findBySubmissionId(SubmissionId submissionId) {
        return jpaRepository.findBySubmissionId(submissionId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<AnalysisRequest> findByStatus(AnalysisStatus status) {
        return jpaRepository.findByStatus(status.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findPendingAnalyses() {
        return jpaRepository.findByStatus(AnalysisStatus.PENDING.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return jpaRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findByProbabilityAbove(BigDecimal threshold) {
        return jpaRepository.findByProbabilityGreaterThan(threshold)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}