package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper.AnalysisEntityMapper;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;


@Repository
public class JpaAnalysisRequestRepositoryAdapter implements AnalysisRequestRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaAnalysisRequestRepositoryAdapter.class);
    private final AnalysisRequestJpaRepository jpaRepository;
    private final AnalysisEntityMapper mapper;

    public JpaAnalysisRequestRepositoryAdapter(
            AnalysisRequestJpaRepository jpaRepository,
            AnalysisEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaAnalysisRequestRepositoryAdapter.");
    }

    @Override
    public AnalysisRequest save(AnalysisRequest analysisRequest) throws JsonProcessingException {
        log.debug("Saving AnalysisRequest {} to database.", analysisRequest.getId().getValue());

        AnalysisRequestJpaEntity entity = mapper.toEntity(analysisRequest);
        AnalysisRequestJpaEntity savedEntity = jpaRepository.save(entity);

        log.trace("Entity saved. Mapping back to domain model.");
        return mapper.toDomain(savedEntity);
    }



    @Override
    public void delete(AnalysisRequest analysisRequest) {
        log.warn("Deleting AnalysisRequest ID: {}", analysisRequest.getId().getValue());
        jpaRepository.deleteById(analysisRequest.getId().getValue());
        log.debug("AnalysisRequest ID {} deleted from persistence.", analysisRequest.getId().getValue());
    }

    @Override
    public List<AnalysisRequest> saveAll(List<AnalysisRequest> analysisRequests) {
        log.debug("Batch saving {} AnalysisRequests to database.", analysisRequests.size());

        if (analysisRequests.isEmpty()) {
            log.trace("Empty list provided to saveAll, returning empty list.");
            return List.of();
        }

        try {
            List<AnalysisRequestJpaEntity> entities = new ArrayList<>();
            for (AnalysisRequest analysisRequest : analysisRequests) {
                log.trace("Mapping AnalysisRequest {} to entity.", analysisRequest.getId().getValue());
                AnalysisRequestJpaEntity entity = mapper.toEntity(analysisRequest);
                entities.add(entity);
            }

            log.debug("Persisting {} entities in batch operation.", entities.size());
            List<AnalysisRequestJpaEntity> savedEntities = jpaRepository.saveAll(entities);

            List<AnalysisRequest> savedAnalysisRequests = savedEntities.stream()
                    .map(entity -> {
                        log.trace("Mapping saved entity {} back to domain.", entity.getId());
                        return mapper.toDomain(entity);
                    })
                    .collect(Collectors.toList());

            log.info("Successfully batch saved {} AnalysisRequests.", savedAnalysisRequests.size());
            return savedAnalysisRequests;

        } catch (JsonProcessingException e) {
            log.error("JsonProcessingException during batch save operation.", e);
            throw new RuntimeException("JsonProcessingException during batch save operation", e);

        } catch (Exception e) {
            log.error("Unexpected error during batch save operation.", e);
            throw new RuntimeException("Failed to batch save AnalysisRequests", e);
        }
    }

    @Override
    public Optional<AnalysisRequest> findById(AnalysisId analysisId) {
        log.debug("Querying database for Analysis ID: {}", analysisId.getValue());
        return jpaRepository.findById(analysisId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<AnalysisRequest> findBySubmissionId(SubmissionId submissionId) {
        log.debug("Querying database by Submission ID: {}", submissionId.getValue());
        List<AnalysisRequestJpaEntity> entities = jpaRepository.findBySubmissionId(submissionId.getValue());

        return entities.stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findByStatus(AnalysisStatus status) {
        log.debug("Querying database for all analyses with status: {}", status.name());
        return jpaRepository.findByStatus(status.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findPendingAnalyses() {
        log.debug("Querying database for PENDING analyses.");
        return jpaRepository.findByStatus(AnalysisStatus.PENDING.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findByDateRange(LocalDateTime start, LocalDateTime end) {
        log.debug("Querying database by date range: {} to {}", start, end);
        return jpaRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisRequest> findByProbabilityAbove(BigDecimal threshold) {
        log.debug("Querying database for completed analyses with probability > {}", threshold);
        return jpaRepository.findByProbabilityGreaterThan(threshold)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}