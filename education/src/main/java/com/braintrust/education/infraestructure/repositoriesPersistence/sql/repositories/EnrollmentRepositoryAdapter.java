package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.EnrollmentRepository;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.EnrollmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Transactional(readOnly = true)
public class EnrollmentRepositoryAdapter implements EnrollmentRepository {

    private final EnrollmentJpaRepository jpaRepository;
    private final EnrollmentEntityMapper mapper;

    public EnrollmentRepositoryAdapter(EnrollmentJpaRepository jpaRepository,
                                       EnrollmentEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public Enrollment save(Enrollment enrollment) {
        EnrollmentJpaEntity entity = mapper.toEntity(enrollment);
        EnrollmentJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    @Transactional
    public void delete(Enrollment enrollment) {
        jpaRepository.deleteById(enrollment.getId().getValue());
    }

    @Override
    public Optional<Enrollment> findById(EnrollmentId enrollmentId) {
        return jpaRepository.findById(enrollmentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Enrollment> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Enrollment> findByCourseId(CourseId courseId) {
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Enrollment> findByStudentId(UserId studentId) {
        return jpaRepository.findByStudentId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Enrollment> findActiveEnrollments(CourseId courseId) {
        return jpaRepository.findActiveByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCourseAndStudent(CourseId courseId, UserId studentId) {
        return jpaRepository.existsByCourseIdAndStudentId(courseId.getValue(), studentId.getValue());
    }
}