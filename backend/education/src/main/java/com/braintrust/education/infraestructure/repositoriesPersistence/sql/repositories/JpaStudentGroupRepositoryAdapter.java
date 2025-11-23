package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.StudentGroupEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.StudentGroupJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Repository
@Transactional(readOnly = true)
public class JpaStudentGroupRepositoryAdapter implements StudentGroupRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaStudentGroupRepositoryAdapter.class);

    private final StudentGroupJpaRepository jpaRepository;
    private final StudentGroupEntityMapper mapper;

    public JpaStudentGroupRepositoryAdapter(
            StudentGroupJpaRepository jpaRepository,
            StudentGroupEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaStudentGroupRepositoryAdapter");
    }

    @Override
    @Transactional
    public StudentGroup save(StudentGroup group) {
        log.debug("Saving StudentGroup ID: {}", group.getId().getValue());
        StudentGroupJpaEntity entity = mapper.toEntity(group);
        StudentGroupJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(StudentGroup group) {
        log.warn("Deleting StudentGroup ID: {}", group.getId().getValue());
        jpaRepository.deleteById(group.getId().getValue());
    }

    @Override
    public Optional<StudentGroup> findById(StudentGroupId groupId) {
        log.debug("Finding StudentGroup by ID: {}", groupId.getValue());
        return jpaRepository.findById(groupId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<StudentGroup> findByCourseId(CourseId courseId) {
        log.debug("Finding groups by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentGroup> findActiveByCourseId(CourseId courseId) {
        log.debug("Finding active groups by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdAndActiveTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentGroup> findByMember(UserId studentId) {
        log.debug("Finding groups by member Student ID: {}", studentId.getValue());
        return jpaRepository.findByMemberId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByNameAndCourse(String name, CourseId courseId) {
        log.trace("Checking existence: name={}, courseId={}", name, courseId.getValue());
        return jpaRepository.existsByNameAndCourseId(name, courseId.getValue());
    }
}