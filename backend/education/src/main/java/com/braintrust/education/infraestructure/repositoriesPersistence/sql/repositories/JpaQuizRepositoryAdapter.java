package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.dtos.dtos.QuizDTO;
import com.braintrust.education.application.ports.out.QuizRepository;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.QuizEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
@Transactional(readOnly = true)
public class JpaQuizRepositoryAdapter implements QuizRepository {

    private static final Logger log = LoggerFactory.getLogger(JpaQuizRepositoryAdapter.class);

    private final QuizJpaRepository jpaRepository;
    private final QuizEntityMapper mapper;

    public JpaQuizRepositoryAdapter(
            QuizJpaRepository jpaRepository,
            QuizEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaQuizRepositoryAdapter");
    }



    @Override
    public List<Quiz> findByCourseIdAndUnitId(CourseId courseId, UnitId unitId) {
        log.debug("Finding quizzes by Course ID: {} and Unit ID: {}",
                courseId.getValue(), unitId.getValue());

        return jpaRepository.findByCourseIdAndUnitId(
                        courseId.getValue(),
                        unitId.getValue()
                ).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }



    @Override
    public List<Quiz> findBasicQuizzesByCourseId(CourseId courseId) {
        log.debug("Finding basic quizzes by Course ID: {} (without questions)", courseId.getValue());
        return jpaRepository.findByCourseIdOrderByCreatedAtDesc(courseId.getValue())
                .stream()
                .map(mapper::mapToBasicQuiz) // Map without questions
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Quiz save(Quiz quiz) {
        log.debug("Saving Quiz ID: {}", quiz.getId().getValue());
        QuizJpaEntity entity = mapper.toEntity(quiz);
        QuizJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(Quiz quiz) {
        log.warn("Deleting Quiz ID: {}", quiz.getId().getValue());
        jpaRepository.deleteById(quiz.getId().getValue());
    }

    @Override
    public Optional<Quiz> findById(QuizId quizId) {
        log.debug("Finding Quiz by ID: {}", quizId.getValue());
        return jpaRepository.findByIdWithQuestions(quizId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Quiz> findByCourseId(CourseId courseId) {
        log.debug("Finding quizzes by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quiz> findActiveQuizzesByCourse(CourseId courseId) {
        log.debug("Finding active quizzes by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdAndActiveTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quiz> findAvailableQuizzes(CourseId courseId, LocalDateTime now) {
        log.debug("Finding available quizzes for Course ID: {} at {}", courseId.getValue(), now);
        return jpaRepository.findAvailableQuizzes(courseId.getValue(), now)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    // NEW: Calendar query implementations
    @Override
    public List<Quiz> findQuizzesByStudentForMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd) {
        log.info("Finding quizzes for Student ID: {} for month {} to {}",
                studentId.getValue(), monthStart, monthEnd);
        return jpaRepository.findQuizzesByStudentForMonth(
                        studentId.getValue(),
                        monthStart,
                        monthEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quiz> findQuizzesByTeacherForMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd) {
        log.info("Finding quizzes for Teacher ID: {} for month {} to {}",
                teacherId.getValue(), monthStart, monthEnd);
        return jpaRepository.findQuizzesByTeacherForMonth(
                        teacherId.getValue(),
                        monthStart,
                        monthEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quiz> findQuizzesByStudentForWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Finding quizzes for Student ID: {} for week {} to {}",
                studentId.getValue(), weekStart, weekEnd);
        return jpaRepository.findQuizzesByStudentForWeek(
                        studentId.getValue(),
                        weekStart,
                        weekEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quiz> findQuizzesByTeacherForWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Finding quizzes for Teacher ID: {} for week {} to {}",
                teacherId.getValue(), weekStart, weekEnd);
        return jpaRepository.findQuizzesByTeacherForWeek(
                        teacherId.getValue(),
                        weekStart,
                        weekEnd
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}