package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.GradeSubmissionCommand;
import com.braintrust.education.application.dtos.commands.ReturnSubmissionCommand;
import com.braintrust.education.application.dtos.commands.SubmitAssignmentCommand;
import com.braintrust.education.application.dtos.commands.SubmitTeamAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.SubmissionAnalyticsDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionBasicDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

public interface SubmissionService {

    // Commands
    void gradeTeamSubmission(GradeSubmissionCommand command);
    SubmissionId submitAssignment(SubmitAssignmentCommand command);
    void gradeSubmission(GradeSubmissionCommand command);

    /*
    void returnSubmissionForRevision(ReturnSubmissionCommand command);
    */

    /*
    void requestAIAnalysis(SubmissionId submissionId);
    */

    SubmissionId submitTeamAssignment(SubmitTeamAssignmentCommand command);

    /*
    List<SubmissionDTO> getSubmissionsByTeamAndAssignment(StudentGroupId teamId, AssignmentId assignmentId);
    */

    boolean isTeamSubmission(SubmissionId submissionId);

    // NEW: Delete submission
    void deleteSubmission(SubmissionId submissionId);

    // Queries
    SubmissionDTO getSubmissionById(SubmissionId submissionId);
    // In SubmissionService interface
    List<SubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId);
    /*
    List<SubmissionDTO> getSubmissionsByAssignment(AssignmentId assignmentId);
    */

    List<SubmissionDTO> getSubmissionsByStudent(UserId studentId);

    // NEW: Get submissions by student and course
    List<SubmissionDTO> getSubmissionsByStudentAndCourse(UserId studentId, CourseId courseId);

    /*
    Optional<SubmissionDTO> getLatestSubmission(AssignmentId assignmentId, UserId studentId);
    */

    /*
    List<SubmissionDTO> getSubmissionsByStatus(SubmissionStatus status);
    */

    /*
    List<SubmissionDTO> getLateSubmissions(AssignmentId assignmentId);
    */

    /*
    SubmissionAnalyticsDTO getSubmissionAnalytics(AssignmentId assignmentId);
    */

    /*
    boolean hasStudentSubmitted(AssignmentId assignmentId, UserId studentId);
    */
}