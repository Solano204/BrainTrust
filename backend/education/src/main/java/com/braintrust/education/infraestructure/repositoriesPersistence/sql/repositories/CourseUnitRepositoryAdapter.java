package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.UnitRepository;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseUnitEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Transactional(readOnly = true)
@Slf4j // ⬅️ Enable the 'log' variable
public class CourseUnitRepositoryAdapter implements UnitRepository {

    private final CourseUnitJpaRepository jpaRepository;
    private final CourseUnitEntityMapper mapper;

    public CourseUnitRepositoryAdapter(CourseUnitJpaRepository jpaRepository,
                                       CourseUnitEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized CourseUnitRepositoryAdapter.");
    }

    @Override
    @Transactional
    public CourseUnit save(CourseUnit unit) {
        log.debug("Saving CourseUnit ID {} to persistence.", unit.getId().getValue());

        CourseUnitJpaEntity entity = mapper.toEntity(unit);
        CourseUnitJpaEntity savedEntity = jpaRepository.save(entity);

        log.trace("Unit saved. Mapping entity back to domain model.");
        return mapper.toDomain(savedEntity);
    }

    @Override
    @Transactional
    public void delete(CourseUnit unit) {
        log.warn("Deleting CourseUnit ID: {}", unit.getId().getValue());
        jpaRepository.deleteById(unit.getId().getValue());
        log.info("CourseUnit ID {} deleted successfully.", unit.getId().getValue());
    }

    @Override
    public Optional<CourseUnit> findById(UnitId unitId) {
        log.debug("Querying database for CourseUnit ID: {}", unitId.getValue());
        return jpaRepository.findById(unitId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<CourseUnit> findByCourseId(CourseId courseId) {
        log.debug("Fetching all units for Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseUnit> findByCourseIdOrderByNumber(CourseId courseId) {
        log.debug("Fetching units for Course ID {} (ordered by number).", courseId.getValue());
        return jpaRepository.findByCourseIdOrderByNumUnity(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}