package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.EnrollmentRepository;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.EnrollmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


@Repository
@Transactional(readOnly = true)
public class EnrollmentRepositoryAdapter implements EnrollmentRepository {

    private static final Logger log =
            LoggerFactory.getLogger(EnrollmentRepositoryAdapter.class);
    private final EnrollmentJpaRepository jpaRepository;
    private final EnrollmentEntityMapper mapper;

    public EnrollmentRepositoryAdapter(EnrollmentJpaRepository jpaRepository,
                                       EnrollmentEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized EnrollmentRepositoryAdapter.");
    }


    @Override
    public int countByCourseAndStatus(CourseId courseId, EnrollmentStatus status) {
        log.debug("Counting enrollments for Course ID: {} with Status: {}",
                courseId.getValue(), status.name());

        long count = jpaRepository.countByCourseIdAndStatus(courseId.getValue(), status.name());


        int result = Math.toIntExact(count);
        log.trace("Found {} enrollments for Course ID: {} with Status: {}",
                result, courseId.getValue(), status.name());

        return result;
    }

    @Override
    public List<String> findStudentIdsByCourse(CourseId courseId, EnrollmentStatus status) {
        log.debug("Finding student IDs for Course ID: {} with Status: {}",
                courseId.getValue(), status.name());

        List<String> studentIds = jpaRepository.findStudentIdsByCourseIdAndStatus(
                courseId.getValue(), status.name());

        log.trace("Found {} student IDs for Course ID: {} with Status: {}",
                studentIds.size(), courseId.getValue(), status.name());

        return studentIds;
    }


    @Override
    @Transactional
    public Enrollment save(Enrollment enrollment) {
        log.info("Saving Enrollment ID {} (Student: {}, Course: {}).",
                enrollment.getId().getValue(), enrollment.getStudentId().getValue(), enrollment.getCourseId().getValue());

        EnrollmentJpaEntity entity = mapper.toEntity(enrollment);
        EnrollmentJpaEntity savedEntity = jpaRepository.save(entity);

        log.debug("Enrollment saved to persistence. Status: {}", savedEntity.getStatus());
        return mapper.toDomain(savedEntity);
    }

    @Override
    @Transactional
    public void delete(Enrollment enrollment) {
        log.warn("Deleting Enrollment ID: {}", enrollment.getId().getValue());
        jpaRepository.deleteById(enrollment.getId().getValue());
        log.info("Enrollment ID {} deleted successfully.", enrollment.getId().getValue());
    }

    @Override
    public Optional<Enrollment> findById(EnrollmentId enrollmentId) {
        log.debug("Querying database for Enrollment ID: {}", enrollmentId.getValue());
        return jpaRepository.findById(enrollmentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Enrollment> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.debug("Querying by Course ID {} and Student ID {}.", courseId.getValue(), studentId.getValue());
        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Enrollment> findByCourseId(CourseId courseId) {
        log.debug("Fetching all enrollments for Course ID: {}.", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Enrollment> findByStudentId(UserId studentId) {
        log.debug("Fetching all courses enrolled by Student ID: {}.", studentId.getValue());
        return jpaRepository.findByStudentId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Enrollment> findActiveEnrollments(CourseId courseId) {
        log.debug("Fetching ACTIVE enrollments for Course ID: {}.", courseId.getValue());
        return jpaRepository.findActiveByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.trace("Checking existence of enrollment for Course ID {} and Student ID {}.", courseId.getValue(), studentId.getValue());
        return jpaRepository.existsByCourseIdAndStudentId(courseId.getValue(), studentId.getValue());
    }
}