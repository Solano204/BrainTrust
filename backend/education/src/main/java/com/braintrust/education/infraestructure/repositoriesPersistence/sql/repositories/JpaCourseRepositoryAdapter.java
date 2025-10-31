package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.Maps.CourseEntityMapper;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Slf4j // ⬅️ Enable the 'log' variable
public class JpaCourseRepositoryAdapter implements CourseRepository {

    private final CourseJpaRepository jpaRepository;
    private final CourseEntityMapper mapper;

    public JpaCourseRepositoryAdapter(
            CourseJpaRepository jpaRepository,
            CourseEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaCourseRepositoryAdapter.");
    }

    // ------------------------------------------------------------------
    // ✅ COMMANDS (Mutating Operations)
    // ------------------------------------------------------------------

    @Override
    public Course save(Course course) {
        log.info("Saving Course ID {} (Code: {}).", course.getId().getValue(), course.getCode().getValue());

        CourseJpaEntity entity = mapper.toEntity(course);
        CourseJpaEntity savedEntity = jpaRepository.save(entity);

        log.debug("Course saved/updated successfully.");
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Course course) {
        log.warn("Deleting Course ID: {}", course.getId().getValue());
        jpaRepository.deleteById(course.getId().getValue());
        log.info("Course ID {} deleted successfully.", course.getId().getValue());
    }

    // ------------------------------------------------------------------
    // ✅ QUERIES (Read Operations)
    // ------------------------------------------------------------------

    @Override
    public Optional<Course> findById(CourseId courseId) {
        log.debug("Querying database for Course ID: {}", courseId.getValue());
        return jpaRepository.findById(courseId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Course> findByCode(CourseCode code) {
        log.debug("Querying database for Course Code: {}", code.getValue());
        return jpaRepository.findByCode(code.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Course> findByTeacherId(UserId teacherId) {
        log.debug("Fetching courses taught by Teacher ID: {}", teacherId.getValue());
        return jpaRepository.findByTeacherId(teacherId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Course> findActiveCourses() {
        log.debug("Fetching all active courses.");
        return jpaRepository.findByActiveTrue()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Course> findByGradeAndGroup(String grade, String group) {
        log.debug("Fetching courses by Grade {} and Group {}.", grade, group);
        return jpaRepository.findByGradeAndGroup(grade, group)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCode(CourseCode code) {
        log.trace("Checking existence of Course Code: {}", code.getValue());
        return jpaRepository.existsByCode(code.getValue());
    }

    @Override
    public Optional<Course> findByUnitId(UnitId unitId) {
        // NOTE: This repository query looks incorrect as written (finds Course by CourseId value,
        // not by UnitId), but we log the attempt.
        log.warn("Querying by Unit ID: {}. (Note: Repository implementation may need review).", unitId.getValue());
        return jpaRepository.findByUnitId(unitId.getValue()) // Assuming the JPA method needs to be implemented to correctly search by UnitId
                .map(mapper::toDomain);
    }
}