package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.AssignmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
public class JpaAssignmentRepositoryAdapter implements AssignmentRepository {

    private static final Logger log = LoggerFactory.getLogger(JpaAssignmentRepositoryAdapter.class);
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
    @Transactional
    public Assignment save(Assignment assignment) {
        log.info("Saving Assignment ID {} to database (Course ID: {}).",
                assignment.getId().getValue(), assignment.getCourseId().getValue());

        AssignmentJpaEntity entity = jpaRepository
                .findByIdWithDocumentsAndLinks(assignment.getId().getValue())
                .orElse(new AssignmentJpaEntity());

        mapper.updateEntity(entity, assignment);

        List<String[]> desiredDocs = assignment.getAttachments().stream()
                .map(d -> new String[]{d.getName(), d.getStoragePath()})
                .toList();
        entity.syncDocuments(desiredDocs);

        List<String> desiredLinks = new ArrayList<>(assignment.getLinks());
        entity.syncLinks(desiredLinks);

        AssignmentJpaEntity savedEntity = jpaRepository.saveAndFlush(entity);
        log.info("Assignment saved/updated. Mapping entity back to domain model.");
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
        log.info("Querying database for Assignment ID: {}", assignmentId.getValue());
        return jpaRepository.findByIdWithDocumentsAndLinks(assignmentId.getValue())
                .map(mapper::toDomain);
    }

    //  NEW 

    @Override
    public List<Assignment> findAll() {
        log.info("Fetching ALL assignments from database.");
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findByTeacherId(UserId teacherId) {
        log.info("Fetching assignments for Teacher ID: {}", teacherId.getValue());
        return jpaRepository.findByTeacherId(teacherId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }


    @Override
    public List<Assignment> findByCourseId(CourseId courseId) {
        log.info("Fetching all assignments for Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdWithDocumentsAndLinks(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findByCourseIdAndUnitId(CourseId courseId, UnitId unitId) {
        log.info("Fetching assignments for Course ID: {} and Unit ID: {}",
                courseId.getValue(), unitId.getValue());
        return jpaRepository.findByCourseIdAndUnitId(courseId.getValue(), unitId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findByStudentCourseUnit(UserId studentId, CourseId courseId, UnitId unitId) {
        log.info("Fetching assignments for Student {} in Course {} Unit {}",
                studentId.getValue(), courseId.getValue(), unitId.getValue());
        return jpaRepository.findByStudentCourseUnit(
                        studentId.getValue(),
                        courseId.getValue(),
                        unitId.getValue()
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findActiveAssignmentsByCourse(CourseId courseId) {
        log.info("Fetching ACTIVE assignments only for Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdAndActiveTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findAssignmentsDueBetween(CourseId courseId, LocalDateTime start, LocalDateTime end) {
        log.info("Fetching assignments due between {} and {} for Course ID: {}", start, end, courseId.getValue());
        return jpaRepository.findByCourseIdAndDueDateBetween(courseId.getValue(), start, end)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

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

    @Override
    public List<Assignment> findAssignmentsByStudentForMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd) {
        log.info("Fetching assignments for Student ID {} for month {} to {}",
                studentId.getValue(), monthStart, monthEnd);
        return jpaRepository.findAssignmentsByStudentForMonth(
                        studentId.getValue(),
                        monthStart,
                        monthEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Assignment> findAssignmentsByTeacherForMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd) {
        log.info("Fetching assignments for Teacher ID {} for month {} to {}",
                teacherId.getValue(), monthStart, monthEnd);
        return jpaRepository.findAssignmentsByTeacherForMonth(
                        teacherId.getValue(),
                        monthStart,
                        monthEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}