package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.UnitRepository;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseUnitEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Transactional(readOnly = true)
public class CourseUnitRepositoryAdapter implements UnitRepository {

    private final CourseUnitJpaRepository jpaRepository;
    private final CourseUnitEntityMapper mapper;

    public CourseUnitRepositoryAdapter(CourseUnitJpaRepository jpaRepository,
                                       CourseUnitEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public CourseUnit save(CourseUnit unit) {
        CourseUnitJpaEntity entity = mapper.toEntity(unit);
        CourseUnitJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    @Transactional
    public void delete(CourseUnit unit) {
        jpaRepository.deleteById(unit.getId().getValue());
    }

    @Override
    public Optional<CourseUnit> findById(UnitId unitId) {
        return jpaRepository.findById(unitId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<CourseUnit> findByCourseId(CourseId courseId) {
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CourseUnit> findByCourseIdOrderByNumber(CourseId courseId) {
        return jpaRepository.findByCourseIdOrderByNumUnity(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}