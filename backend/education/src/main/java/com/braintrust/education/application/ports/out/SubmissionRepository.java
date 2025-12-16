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

    // Commands
    Submission save(Submission submission);
    void delete(Submission submission);

    // Queries
    Optional<Submission> findById(SubmissionId submissionId);

    List<Submission> findByAssignmentId(AssignmentId assignmentId);

    List<Submission> findByStudentId(UserId studentId);
    // In QuizSubmissionRepository interface - add these methods

    List<Submission> findByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId);

    // In SubmissionRepository interface
    List<Submission> findByCourseId(CourseId courseId);

    /*
    Optional<Submission> findLatestByAssignmentAndStudent(AssignmentId assignmentId, UserId studentId);
    */

    /*
    List<Submission> findByStatus(SubmissionStatus status);
    */

    /*
    List<Submission> findLateSubmissions(AssignmentId assignmentId, LocalDateTime dueDate);
    */

    /*
    List<Submission> findByTeamId(StudentGroupId teamId);
    */

    /*
    List<Submission> findByTeamIdAndAssignmentId(StudentGroupId teamId, AssignmentId assignmentId);
    */

    /*
    boolean existsByAssignmentAndTeam(AssignmentId assignmentId, StudentGroupId teamId);
    */

    // NEW: Find submissions by course and student
    List<Submission> findByCourseAndStudent(CourseId courseId, UserId studentId);

    /*
    List<Submission> findByCourseId(CourseId courseId);
    */
}