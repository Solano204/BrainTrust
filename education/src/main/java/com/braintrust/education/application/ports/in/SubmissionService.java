package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.GradeSubmissionCommand;
import com.braintrust.education.application.dtos.commands.ReturnSubmissionCommand;
import com.braintrust.education.application.dtos.commands.SubmitAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.SubmissionAnalyticsDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/in/SubmissionService.java
public interface SubmissionService {

    // Commands
    SubmissionId submitAssignment(SubmitAssignmentCommand command);
    void gradeSubmission(GradeSubmissionCommand command);
    void returnSubmissionForRevision(ReturnSubmissionCommand command);
    void requestAIAnalysis(SubmissionId submissionId);

    // Queries
    SubmissionDTO getSubmissionById(SubmissionId submissionId);
    List<SubmissionDTO> getSubmissionsByAssignment(AssignmentId assignmentId);
    List<SubmissionDTO> getSubmissionsByStudent(UserId studentId);
    Optional<SubmissionDTO> getLatestSubmission(AssignmentId assignmentId, UserId studentId);
    List<SubmissionDTO> getSubmissionsByStatus(SubmissionStatus status);
    List<SubmissionDTO> getLateSubmissions(AssignmentId assignmentId);
    SubmissionAnalyticsDTO getSubmissionAnalytics(AssignmentId assignmentId);
    boolean hasStudentSubmitted(AssignmentId assignmentId, UserId studentId);
}