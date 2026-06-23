package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository {

    Submission save(Submission submission);
    void delete(Submission submission);

    Optional<Submission> findById(SubmissionId submissionId);

    List<Submission> findByAssignmentId(AssignmentId assignmentId);

    List<Submission> findByStudentId(UserId studentId);

    List<Submission> findByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId);

    List<Submission> findByCourseId(CourseId courseId);

    List<Submission> findByCourseAndStudent(CourseId courseId, UserId studentId);

    List<Submission> findByCourseAndStudentOrderedByUnit(CourseId courseId, UserId studentId);
}