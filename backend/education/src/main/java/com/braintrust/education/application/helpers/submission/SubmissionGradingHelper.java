package com.braintrust.education.application.helpers.submission;

import com.braintrust.education.application.dtos.commands.GradeSubmissionCommand;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.in.UnitGradeService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class SubmissionGradingHelper {

    private static final Logger log = LoggerFactory.getLogger(SubmissionGradingHelper.class);

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradebookService gradebookService;
    private final UnitGradeService unitGradeService;

    public SubmissionGradingHelper(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            GradebookService gradebookService,
            UnitGradeService unitGradeService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.gradebookService = gradebookService;
        this.unitGradeService = unitGradeService;
    }

    @Transactional
    public void gradeSubmission(GradeSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        log.info("Grading Submission {} with score: {}/{}",
                submissionId.getValue(), command.gradeValue(), command.maxScore());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);

            Grade grade = new Grade(
                    new BigDecimal(command.gradeValue()),
                    new BigDecimal(command.maxScore())
            );

            submission.grade(grade, command.feedback());
            Submission savedSubmission = submissionRepository.save(submission);

            Assignment assignment = assignmentRepository.findById(savedSubmission.getAssignmentId())
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            syncGradesAfterSubmission(savedSubmission, assignment);

            log.info("Submission {} graded successfully", submissionId.getValue());

        } catch (Exception e) {
            log.error("Failed to grade Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void gradeTeamSubmission(GradeSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        log.info("Grading TEAM Submission {} with score: {}/{}",
                submissionId.getValue(), command.gradeValue(), command.maxScore());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);

            if (submission.getTeamId() == null) {
                throw new IllegalStateException("This is not a team submission");
            }

            Grade grade = new Grade(
                    new BigDecimal(command.gradeValue()),
                    new BigDecimal(command.maxScore())
            );

            submission.grade(grade, command.feedback());
            Submission savedSubmission = submissionRepository.save(submission);

            gradebookService.applyTeamGradeToAllMembers(
                    savedSubmission.getAssignmentId(),
                    savedSubmission.getTeamId()
            );

            log.info("Team grade applied to all members of group {} with gradebook & unit updates",
                    savedSubmission.getTeamId().getValue());

        } catch (Exception e) {
            log.error("Failed to grade team submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deleteSubmission(SubmissionId submissionId) {
        log.warn("Deleting submission ID: {}", submissionId.getValue());

        Submission submission = findSubmissionByIdOrThrow(submissionId);
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        CourseId courseId = assignment.getCourseId();
        UserId studentId = submission.getStudentId();
        UnitId unitId = assignment.getUnitId();

        boolean affectsUnitGrade = submission.isGraded() && unitId != null;

        if (affectsUnitGrade) {
            unitGradeService.removeAssignmentGradeFromUnit(unitId, studentId, assignment.getId());
            gradebookService.syncUnitGrade(courseId, studentId, unitId);
        }

        submissionRepository.delete(submission);
        log.info("Submission deleted and grade REMOVED from unit grade");
    }

    private void syncGradesAfterSubmission(Submission submission, Assignment assignment) {
        if (assignment.getUnitId() != null && submission.getGrade() != null) {
            unitGradeService.addAssignmentGradeToUnit(
                    assignment.getUnitId(),
                    submission.getStudentId(),
                    assignment.getId(),
                    submission.getGrade()
            );

            gradebookService.syncUnitGrade(
                    assignment.getCourseId(),
                    submission.getStudentId(),
                    assignment.getUnitId()
            );
        }

        if (submission.getTeamId() != null && assignment.isTeamAssignment()) {
            gradebookService.applyTeamGradeToAllMembers(
                    assignment.getId(),
                    submission.getTeamId()
            );
        } else {
            gradebookService.syncAssignmentGrade(
                    assignment.getCourseId(),
                    submission.getStudentId(),
                    submission.getAssignmentId()
            );
        }
    }

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException(
                        "Submission not found: " + submissionId.getValue()));
    }
}