package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaSubmissionRepositoryAdapter implements SubmissionRepository {

    private final SubmissionJpaRepository jpaRepository;
    private final SubmissionEntityMapper mapper;

    public JpaSubmissionRepositoryAdapter(
            SubmissionJpaRepository jpaRepository,
            SubmissionEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Submission save(Submission submission) {
        SubmissionJpaEntity entity = mapper.toEntity(submission);
        SubmissionJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Submission submission) {
        jpaRepository.deleteById(submission.getId().getValue());
    }

    @Override
    public Optional<Submission> findById(SubmissionId submissionId) {
        return jpaRepository.findById(submissionId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Submission> findByAssignmentId(AssignmentId assignmentId) {
        return jpaRepository.findByAssignmentId(assignmentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Submission> findByStudentId(UserId studentId) {
        return jpaRepository.findByStudentId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Submission> findByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId) {
        return jpaRepository.findByAssignmentIdAndStudentId(assignmentId.getValue(), studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Submission> findLatestByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId) {
        return jpaRepository.findFirstByAssignmentIdAndStudentIdOrderBySubmittedAtDesc(
                assignmentId.getValue(),
                studentId.getValue()
        ).map(mapper::toDomain);
    }

    @Override
    public List<Submission> findByStatus(SubmissionStatus status) {
        return jpaRepository.findByStatus(status.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Submission> findLateSubmissions(AssignmentId assignmentId, LocalDateTime dueDate) {
        return jpaRepository.findByAssignmentIdAndSubmittedAtAfter(assignmentId.getValue(), dueDate)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}