package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;



// 📍 education/infrastructure/persistence/JpaCourseRepositoryAdapter.java

import com.braintrust.education.application.Maps.CourseEntityMapper;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Repository
public class JpaCourseRepositoryAdapter implements CourseRepository {

    private final CourseJpaRepository jpaRepository;
    private final CourseEntityMapper mapper;

    public JpaCourseRepositoryAdapter(
            CourseJpaRepository jpaRepository,
            CourseEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Course save(Course course) {
        CourseJpaEntity entity = mapper.toEntity(course);
        CourseJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Course course) {
        jpaRepository.deleteById(course.getId().getValue());
    }

    @Override
    public Optional<Course> findById(CourseId courseId) {
        return jpaRepository.findById(courseId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Course> findByCode(CourseCode code) {
        return jpaRepository.findByCode(code.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Course> findByTeacherId(UserId teacherId) {
        return jpaRepository.findByTeacherId(teacherId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Course> findActiveCourses() {
        return jpaRepository.findByActiveTrue()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Course> findByGradeAndGroup(String grade, String group) {
        return jpaRepository.findByGradeAndGroup(grade, group)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCode(CourseCode code) {
        return jpaRepository.existsByCode(code.getValue());
    }

    @Override
    public Optional<Course> findByUnitId(UnitId unitId) {
        return jpaRepository.findById(unitId.getValue())
                .map(mapper::toDomain);
    }
}