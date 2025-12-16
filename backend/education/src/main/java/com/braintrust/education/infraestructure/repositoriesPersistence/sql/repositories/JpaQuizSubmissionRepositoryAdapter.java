package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.QuizSubmissionRepository;
import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.QuizSubmissionId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.QuizSubmissionEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizSubmissionJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
@Transactional(readOnly = true)
public class JpaQuizSubmissionRepositoryAdapter implements QuizSubmissionRepository {

    private static final Logger log = LoggerFactory.getLogger(JpaQuizSubmissionRepositoryAdapter.class);
    private final QuizSubmissionJpaRepository jpaRepository;
    private final QuizSubmissionEntityMapper mapper;

    public JpaQuizSubmissionRepositoryAdapter(
            QuizSubmissionJpaRepository jpaRepository,
            QuizSubmissionEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaQuizSubmissionRepositoryAdapter");
    }

    @Override
    public List<QuizSubmission> findByCourseIdOrderBySubmittedAtDesc(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} ordered by submitted date", courseId.getValue());
        return jpaRepository.findByCourseIdOrderBySubmittedAtDesc(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizSubmission> findByCourseIdAndUnitIdOrderBySubmittedAtDesc(CourseId courseId, UnitId unitId) {
        log.debug("Finding quiz submissions by Course ID: {} and Unit ID: {} ordered by submitted date",
                courseId.getValue(), unitId.getValue());
        return jpaRepository.findByCourseIdAndUnitIdOrderBySubmittedAtDesc(courseId.getValue(), unitId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizSubmission> findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(UserId studentId, CourseId courseId, UnitId unitId) {
        log.debug("Finding quiz submissions by Student ID: {}, Course ID: {} and Unit ID: {} ordered by submitted date",
                studentId.getValue(), courseId.getValue(), unitId.getValue());
        return jpaRepository.findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(
                        studentId.getValue(), courseId.getValue(), unitId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizSubmission save(QuizSubmission submission) {
        log.debug("Saving QuizSubmission ID: {}", submission.getId().getValue());
        QuizSubmissionJpaEntity entity = mapper.toEntity(submission);
        QuizSubmissionJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(QuizSubmission submission) {
        log.warn("Deleting QuizSubmission ID: {}", submission.getId().getValue());
        jpaRepository.deleteById(submission.getId().getValue());
    }

    @Override
    public Optional<QuizSubmission> findById(QuizSubmissionId submissionId) {
        log.debug("Finding QuizSubmission by ID: {}", submissionId.getValue());
        return jpaRepository.findById(submissionId.getValue())
                .map(mapper::toDomain);
    }

    /*
    @Override
    public List<QuizSubmission> findByQuizId(QuizId quizId) {
        log.debug("Finding submissions by Quiz ID: {}", quizId.getValue());
        return jpaRepository.findByQuizId(quizId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    @Override
    public List<QuizSubmission> findByStudentId(UserId studentId) {
        log.debug("Finding submissions by Student ID: {}", studentId.getValue());
        return jpaRepository.findByStudentId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    /*
    @Override
    public List<QuizSubmission> findByQuizAndStudent(QuizId quizId, UserId studentId) {
        log.debug("Finding submissions by Quiz ID: {} and Student ID: {}",
                quizId.getValue(), studentId.getValue());
        return jpaRepository.findByQuizIdAndStudentId(quizId.getValue(), studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    @Override
    public Optional<QuizSubmission> findLatestByQuizAndStudent(QuizId quizId, UserId studentId) {
        log.debug("Finding latest submission for Quiz ID: {} and Student ID: {}",
                quizId.getValue(), studentId.getValue());
        return jpaRepository.findLatestByQuizAndStudent(quizId.getValue(), studentId.getValue())
                .map(mapper::toDomain);
    }

    /*
    @Override
    public List<QuizSubmission> findByStatus(QuizSubmissionStatus status) {
        log.debug("Finding submissions by status: {}", status.name());
        return jpaRepository.findByStatus(status.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    @Override
    public int countAttempts(QuizId quizId, UserId studentId) {
        log.debug("Counting attempts for Quiz ID: {} and Student ID: {}",
                quizId.getValue(), studentId.getValue());
        return jpaRepository.countByQuizIdAndStudentId(quizId.getValue(), studentId.getValue());
    }

    /*
    @Override
    public List<QuizSubmission> findInProgressSubmissions(UserId studentId) {
        log.debug("Finding in-progress submissions for Student ID: {}", studentId.getValue());
        return jpaRepository.findByStudentIdAndStatus(
                        studentId.getValue(),
                        QuizSubmissionStatus.IN_PROGRESS.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    public List<QuizSubmission> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.debug("Finding quiz submissions by Course ID: {} and Student ID: {}",
                courseId.getValue(), studentId.getValue());

        // This requires a JOIN with quizzes to get the course_id
        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */
}