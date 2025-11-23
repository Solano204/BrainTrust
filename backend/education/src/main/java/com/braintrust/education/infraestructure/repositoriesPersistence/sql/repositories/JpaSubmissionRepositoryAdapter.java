package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.SubmissionEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
// other imports...

@Repository
public class JpaSubmissionRepositoryAdapter implements SubmissionRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaSubmissionRepositoryAdapter.class);
    private final SubmissionJpaRepository jpaRepository;
    private final SubmissionEntityMapper mapper;

    public JpaSubmissionRepositoryAdapter(
            SubmissionJpaRepository jpaRepository,
            SubmissionEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaSubmissionRepositoryAdapter.");
    }


    @Override
    public List<Submission> findByCourseId(CourseId courseId) {
        log.debug("Finding submissions by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Submission save(Submission submission) {
        log.info("Saving Submission ID {} (Student: {}).",
                submission.getId().getValue(), submission.getStudentId().getValue());

        SubmissionJpaEntity entity = mapper.toEntity(submission);
        SubmissionJpaEntity savedEntity = jpaRepository.save(entity);

        log.debug("Submission saved/updated. Status: {}", savedEntity.getStatus());
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Submission submission) {
        log.warn("Deleting Submission ID: {}", submission.getId().getValue());
        jpaRepository.deleteById(submission.getId().getValue());
        log.info("Submission ID {} deleted successfully.", submission.getId().getValue());
    }

    @Override
    public Optional<Submission> findById(SubmissionId submissionId) {
        log.debug("Querying database for Submission ID: {}", submissionId.getValue());
        return jpaRepository.findByIdWithDocuments(submissionId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Submission> findByAssignmentId(AssignmentId assignmentId) {
        log.debug("Fetching all submissions for Assignment ID: {}", assignmentId.getValue());
        return jpaRepository.findByAssignmentIdWithDocuments(assignmentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Submission> findByStudentId(UserId studentId) {
        log.debug("Fetching all submissions by Student ID: {}", studentId.getValue());
        return jpaRepository.findByStudentIdWithDocuments(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Submission> findByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId) {
        log.debug("Fetching submissions by Assignment ID {} and Student ID {}", assignmentId.getValue(), studentId.getValue());
        return jpaRepository.findByAssignmentIdAndStudentIdWithDocuments(
                        assignmentId.getValue(),
                        studentId.getValue()
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    /*
    @Override
    public Optional<Submission> findLatestByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId) {
        log.debug("Fetching LATEST submission for Assignment {} by Student {}", assignmentId.getValue(), studentId.getValue());
        return jpaRepository.findFirstByAssignmentIdAndStudentIdWithDocumentsOrderBySubmittedAtDesc(
                assignmentId.getValue(),
                studentId.getValue()
        ).map(mapper::toDomain);
    }
    */

    /*
    @Override
    public List<Submission> findByStatus(SubmissionStatus status) {
        log.debug("Fetching submissions with Status: {}", status.name());
        return jpaRepository.findByStatusWithDocuments(status.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    public List<Submission> findLateSubmissions(AssignmentId assignmentId, LocalDateTime dueDate) {
        log.warn("Querying for LATE submissions for Assignment ID {} (Due: {}).", assignmentId.getValue(), dueDate);
        return jpaRepository.findByAssignmentIdAndSubmittedAtAfterWithDocuments(
                        assignmentId.getValue(),
                        dueDate
                )
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    @Override
    public List<Submission> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.debug("Finding submissions by Course ID: {} and Student ID: {}",
                courseId.getValue(), studentId.getValue());

        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    /*
    @Override
    public List<Submission> findByCourseId(CourseId courseId) {
        log.debug("Finding submissions by Course ID: {}", courseId.getValue());

        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    public List<Submission> findByTeamId(StudentGroupId teamId) {
        log.debug("Fetching submissions by Team ID: {}", teamId.getValue());
        return jpaRepository.findByTeamIdWithDocuments(teamId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    public List<Submission> findByTeamIdAndAssignmentId(StudentGroupId teamId, AssignmentId assignmentId) {
        log.debug("Fetching submissions by Team {} and Assignment {}", teamId.getValue(), assignmentId.getValue());
        return jpaRepository.findByTeamIdAndAssignmentIdWithDocuments(teamId.getValue(), assignmentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    public boolean existsByAssignmentAndTeam(AssignmentId assignmentId, StudentGroupId teamId) {
        return jpaRepository.existsByAssignmentIdAndTeamId(assignmentId.getValue(), teamId.getValue());
    }
    */
}