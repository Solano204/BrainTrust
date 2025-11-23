package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.GradebookRepository;
import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.GradebookId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.GradebookEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.GradebookJpaEntity;
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
public class JpaGradebookRepositoryAdapter implements GradebookRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaGradebookRepositoryAdapter.class);
    private final GradebookJpaRepository jpaRepository;
    private final GradebookEntityMapper mapper;

    public JpaGradebookRepositoryAdapter(
            GradebookJpaRepository jpaRepository,
            GradebookEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaGradebookRepositoryAdapter");
    }

    @Override
    @Transactional
    public Gradebook save(Gradebook gradebook) {
        log.debug("Saving Gradebook ID: {}", gradebook.getId().getValue());
        GradebookJpaEntity entity = mapper.toEntity(gradebook);
        GradebookJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(Gradebook gradebook) {
        log.warn("Deleting Gradebook ID: {}", gradebook.getId().getValue());
        jpaRepository.deleteById(gradebook.getId().getValue());
    }

    @Override
    public Optional<Gradebook> findById(GradebookId gradebookId) {
        log.debug("Finding Gradebook by ID: {}", gradebookId.getValue());
        return jpaRepository.findById(gradebookId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Gradebook> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.debug("Finding Gradebook by Course ID: {} and Student ID: {}",
                courseId.getValue(), studentId.getValue());
        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Gradebook> findByCourseId(CourseId courseId) {
        log.debug("Finding gradebooks by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.trace("Checking existence: courseId={}, studentId={}",
                courseId.getValue(), studentId.getValue());
        return jpaRepository.existsByCourseIdAndStudentId(courseId.getValue(), studentId.getValue());
    }
}