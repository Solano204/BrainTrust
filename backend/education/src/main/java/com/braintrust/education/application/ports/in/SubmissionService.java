package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.GradeSubmissionCommand;
import com.braintrust.education.application.dtos.commands.ReturnSubmissionCommand;
import com.braintrust.education.application.dtos.commands.SubmitAssignmentCommand;
import com.braintrust.education.application.dtos.commands.SubmitTeamAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
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
    SubmissionId submitAssignmentFrontend(SubmitAssignmentFrontendDTO command);
    SubmissionId submitTeamAssignmentFrontend(SubmitTeamAssignmentFrontendDTO command);

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


    // NEW: Get submissions by course and unit
    List<SubmissionDTO> getSubmissionsByCourseAndUnit(CourseId courseId, UnitId unitId);

    // NEW: Get submissions by student, course and unit
    List<SubmissionDTO> getSubmissionsByStudentAndCourseAndUnit(UserId studentId, CourseId courseId, UnitId unitId);
}