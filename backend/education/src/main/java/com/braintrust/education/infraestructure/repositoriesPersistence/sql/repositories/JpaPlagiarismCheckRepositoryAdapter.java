package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.PlagiarismCheckRepository;
import com.braintrust.education.domain.model.PlagiarismCheck;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.PlagiarismCheckId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.PlagiarismCheckEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.PlagiarismCheckJpaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaPlagiarismCheckRepositoryAdapter implements PlagiarismCheckRepository {

    private static final Logger log = LoggerFactory.getLogger(JpaPlagiarismCheckRepositoryAdapter.class);

    private final PlagiarismCheckJpaRepository jpaRepository;
    private final PlagiarismCheckEntityMapper mapper;

    public JpaPlagiarismCheckRepositoryAdapter(PlagiarismCheckJpaRepository jpaRepository,
                                               PlagiarismCheckEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public PlagiarismCheck save(PlagiarismCheck check) {
        PlagiarismCheckJpaEntity entity = mapper.toEntity(check);
        PlagiarismCheckJpaEntity saved = jpaRepository.save(entity);
        log.debug("Saved plagiarism check id={}", saved.getId());
        return mapper.toDomain(saved);
    }

    @Override
    public void saveAll(List<PlagiarismCheck> checks) {
        List<PlagiarismCheckJpaEntity> entities = checks.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        jpaRepository.saveAll(entities);
        log.debug("Saved plagiarism checks count={}", entities.size());
    }

    @Override
    public Optional<PlagiarismCheck> findById(PlagiarismCheckId id) {
        return jpaRepository.findByIdWithParagraphs(id.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<PlagiarismCheck> findBySourceSubmissionId(SubmissionId submissionId) {
        return jpaRepository.findBySourceSubmissionIdWithParagraphs(submissionId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlagiarismCheck> findByAssignmentId(AssignmentId assignmentId) {
        return jpaRepository.findByAssignmentIdWithParagraphs(assignmentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsBySourceAndCompared(SubmissionId sourceId, SubmissionId comparedId) {
        return jpaRepository.existsBySourceSubmissionIdAndComparedSubmissionId(
                sourceId.getValue(), comparedId.getValue());
    }
}
