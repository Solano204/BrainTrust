package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.AssignmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Slf4j
public class JpaAssignmentRepositoryAdapter implements AssignmentRepository {

    private final AssignmentJpaRepository jpaRepository;
    private final AssignmentEntityMapper mapper;

    public JpaAssignmentRepositoryAdapter(
            AssignmentJpaRepository jpaRepository,
            AssignmentEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaAssignmentRepositoryAdapter.");
    }

    @Override
    public Assignment save(Assignment assignment) {
        log.info("Saving Assignment ID {} to database (Course ID: {}).",
                assignment.getId().getValue(), assignment.getCourseId().getValue());
        AssignmentJpaEntity entity = mapper.toEntity(assignment);
        AssignmentJpaEntity savedEntity = jpaRepository.save(entity);
        log.debug("Assignment saved/updated. Mapping entity back to domain model.");
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Assignment assignment) {
        log.warn("Deleting Assignment ID: {}", assignment.getId().getValue());
        jpaRepository.deleteById(assignment.getId().getValue());
        log.info("Assignment ID {} deleted successfully.", assignment.getId().getValue());
    }

    @Override
    public Optional<Assignment> findById(AssignmentId assignmentId) {
        log.debug("Querying database for Assignment ID: {}", assignmentId.getValue());
        return jpaRepository.findByIdWithDocuments(assignmentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Assignment> findByCourseId(CourseId courseId) {
        log.debug("Fetching all assignments for Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdWithDocuments(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findActiveAssignmentsByCourse(CourseId courseId) {
        log.debug("Fetching ACTIVE assignments only for Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdAndActiveTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end) {
        log.debug("Fetching assignments due between {} and {} for Course ID: {}", start, end, courseId.getValue());
        return jpaRepository.findByCourseIdAndDueDateBetween(courseId.getValue(), start, end)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    // ✅ NEW: Get all assignments for a student across all their courses for a week
    @Override
    public List<Assignment> findAssignmentsByStudentForWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Fetching assignments for Student ID {} for week {} to {}",
                studentId.getValue(), weekStart, weekEnd);
        return jpaRepository.findAssignmentsByStudentForWeek(
                        studentId.getValue(),
                        weekStart,
                        weekEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    // ✅ NEW: Get all assignments for a teacher across all their courses for a week
    @Override
    public List<Assignment> findAssignmentsByTeacherForWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Fetching assignments for Teacher ID {} for week {} to {}",
                teacherId.getValue(), weekStart, weekEnd);
        return jpaRepository.findAssignmentsByTeacherForWeek(
                        teacherId.getValue(),
                        weekStart,
                        weekEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}