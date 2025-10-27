package com.braintrust.education.application.ports.out;


import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/out/SubmissionRepository.java
public interface SubmissionRepository {

    // Commands
    Submission save(Submission submission);
    void delete(Submission submission);

    // Queries
    Optional<Submission> findById(SubmissionId submissionId);
    List<Submission> findByAssignmentId(AssignmentId assignmentId);
    List<Submission> findByStudentId(UserId studentId);
    List<Submission> findByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId);
    Optional<Submission> findLatestByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId);
    List<Submission> findByStatus(SubmissionStatus status);
    List<Submission> findLateSubmissions(AssignmentId assignmentId, LocalDateTime dueDate);
}