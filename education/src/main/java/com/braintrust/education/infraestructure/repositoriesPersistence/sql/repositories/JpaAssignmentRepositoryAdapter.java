package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.AssignmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository

public class JpaAssignmentRepositoryAdapter implements AssignmentRepository {

    private final AssignmentJpaRepository jpaRepository;
    private final AssignmentEntityMapper mapper;

    public JpaAssignmentRepositoryAdapter(
            AssignmentJpaRepository jpaRepository,
            AssignmentEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }



    @Override
    public Assignment save(Assignment assignment) {
        AssignmentJpaEntity entity = mapper.toEntity(assignment);
        AssignmentJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Assignment assignment) {
        jpaRepository.deleteById(assignment.getId().getValue());
    }

    @Override
    public Optional<Assignment> findById(AssignmentId assignmentId) {
        return jpaRepository.findByIdWithDocuments(assignmentId.getValue())
                .map(mapper::toDomain);
    }
    @Override
    public List<Assignment> findByCourseId(CourseId courseId) {
        return jpaRepository.findByCourseIdWithDocuments(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findActiveAssignmentsByCourse(CourseId courseId) {
        return jpaRepository.findByCourseIdAndActiveTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end) {
        return jpaRepository.findByCourseIdAndDueDateBetween(courseId.getValue(), start, end)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}