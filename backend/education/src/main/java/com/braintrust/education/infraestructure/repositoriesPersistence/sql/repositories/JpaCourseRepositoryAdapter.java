package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.Maps.CourseEntityMapper;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

@Repository
public class JpaCourseRepositoryAdapter implements CourseRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaCourseRepositoryAdapter.class);
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

    @Override
    public Page<Course> findAll(Pageable pageable) {
        log.debug("📊 Fetching paginated courses. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        Page<CourseJpaEntity> entityPage = jpaRepository.findAll(pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public Page<Course> findActiveCourses(Pageable pageable) {
        log.debug("📊 Fetching paginated active courses. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        Page<CourseJpaEntity> entityPage = jpaRepository.findByActiveTrue(pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public Page<Course> findByTeacherId(UserId teacherId, Pageable pageable) {
        log.debug("📊 Fetching paginated courses for Teacher ID: {}. Page: {}, Size: {}",
                teacherId.getValue(), pageable.getPageNumber(), pageable.getPageSize());
        Page<CourseJpaEntity> entityPage = jpaRepository.findByTeacherId(teacherId.getValue(), pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public Page<Course> findByStudentId(UserId studentId, Pageable pageable) {
        log.debug("📊 Fetching paginated courses for Student ID: {}. Page: {}, Size: {}",
                studentId.getValue(), pageable.getPageNumber(), pageable.getPageSize());
        Page<CourseJpaEntity> entityPage = jpaRepository.findByStudentId(studentId.getValue(), pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public List<Course> findAll() {
        log.debug("📊 Fetching all courses (without pagination)");
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Course> findActiveCourses() {
        log.debug("📊 Fetching all active courses (without pagination)");
        return jpaRepository.findByActiveTrue()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

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

    @Override
    public Optional<Course> findById(CourseId courseId) {
        log.debug("Querying database for Course ID: {}", courseId.getValue());
        return jpaRepository.findById(courseId.getValue())
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
    public List<Course> findByStudentId(UserId studentId) {
        log.debug("Fetching courses for Student ID: {}", studentId.getValue());
        return jpaRepository.findByStudentId(studentId.getValue())
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
        log.debug("Querying by Unit ID: {}", unitId.getValue());
        return jpaRepository.findByUnitId(unitId.getValue())
                .map(mapper::toDomain);
    }
}