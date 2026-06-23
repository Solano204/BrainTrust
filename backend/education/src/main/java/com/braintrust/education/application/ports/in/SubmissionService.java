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

    void gradeTeamSubmission(GradeSubmissionCommand command);
    SubmissionId submitAssignment(SubmitAssignmentCommand command);
    void gradeSubmission(GradeSubmissionCommand command);

    SubmissionId submitAssignmentFrontend(SubmitAssignmentFrontendDTO command);
    SubmissionId submitTeamAssignmentFrontend(SubmitTeamAssignmentFrontendDTO command);

    SubmissionId submitTeamAssignment(SubmitTeamAssignmentCommand command);

    boolean isTeamSubmission(SubmissionId submissionId);

    void deleteSubmission(SubmissionId submissionId);

    SubmissionDTO getSubmissionById(SubmissionId submissionId);

    List<SubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId);

    List<SubmissionDTO> getSubmissionsByStudent(UserId studentId);

    List<SubmissionDTO> getSubmissionsByStudentAndCourse(UserId studentId, CourseId courseId);

    List<SubmissionDTO> getSubmissionsByCourseAndUnit(CourseId courseId, UnitId unitId);

    List<SubmissionDTO> getSubmissionsByStudentAndCourseAndUnit(UserId studentId, CourseId courseId, UnitId unitId);

    StudentHistoryDTO getStudentHistory(CourseId courseId, UserId studentId);
}