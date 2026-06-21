package com.braintrust.education.application.helpers.gradebook;

import com.braintrust.education.application.dtos.commands.UpdateGradeFromGradebookCommand;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class GradeUpdateHelper {

    private static final Logger log = LoggerFactory.getLogger(GradeUpdateHelper.class);

    private final SubmissionRepository submissionRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final UnitGradeRepository unitGradeRepository;

    public GradeUpdateHelper(
            SubmissionRepository submissionRepository,
            QuizSubmissionRepository quizSubmissionRepository,
            QuizRepository quizRepository,
            AssignmentRepository assignmentRepository,
            UnitGradeRepository unitGradeRepository) {
        this.submissionRepository = submissionRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.unitGradeRepository = unitGradeRepository;
    }

    public void updateAssignmentGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        AssignmentId assignmentId = AssignmentId.fromString(command.activityId());

        log.debug("Updating assignment grade bidirectionally");

        List<Submission> submissions = submissionRepository
                .findByAssignmentAndStudent(assignmentId, studentId);

        if (submissions.isEmpty()) {
            log.warn("No submission found for assignment {}, creating placeholder",
                    assignmentId.getValue());

            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            Submission newSubmission = Submission.create(
                    assignmentId,
                    studentId,
                    "Graded from gradebook (no submission)",
                    List.of(),
                    SubmissionStatus.GRADED,
                    null
            );
            newSubmission.grade(newGrade, command.feedback());
            submissionRepository.save(newSubmission);

        } else {
            Submission submission = submissions.get(0);
            submission.grade(newGrade, command.feedback());
            submissionRepository.save(submission);

            log.debug("Source submission updated");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        if (assignment.getUnitId() != null) {
            updateUnitGradeForAssignment(
                    assignment.getUnitId(),
                    assignmentId,
                    studentId,
                    newGrade,
                    gradebook
            );
        }
    }

    public void updateQuizGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        QuizId quizId = QuizId.fromString(command.activityId());

        log.debug("Updating quiz grade bidirectionally");

        QuizSubmission quizSubmission = quizSubmissionRepository
                .findLatestByQuizAndStudent(quizId, studentId)
                .orElseThrow(() -> new SubmissionNotFoundException(
                        "Quiz submission not found for quiz " + quizId.getValue()
                ));

        quizSubmission.manualGrade(
                newGrade.getValue().intValue(),
                newGrade.getMaxScore().intValue()
        );
        quizSubmissionRepository.save(quizSubmission);

        log.debug("Source quiz submission updated");

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        if (quiz.getUnitId() != null) {
            updateUnitGradeForQuiz(
                    quiz.getUnitId(),
                    quizId,
                    studentId,
                    newGrade,
                    gradebook
            );
        }
    }

    public void updateUnitGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        UnitId unitId = UnitId.fromString(command.activityId());

        log.warn("Unit grades are auto-calculated. Only updating feedback.");

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.setFinalFeedback(command.feedback());
        unitGradeRepository.save(unitGrade);
    }

    private void updateUnitGradeForAssignment(
            UnitId unitId,
            AssignmentId assignmentId,
            UserId studentId,
            Grade assignmentGrade,
            Gradebook gradebook) {

        log.debug("Cascading assignment grade to unit {}", unitId.getValue());

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addAssignmentGrade(assignmentId, assignmentGrade);
        unitGradeRepository.save(unitGrade);

        BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
        }
    }

    private void updateUnitGradeForQuiz(
            UnitId unitId,
            QuizId quizId,
            UserId studentId,
            Grade quizGrade,
            Gradebook gradebook) {

        log.debug("Cascading quiz grade to unit {}", unitId.getValue());

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addQuizGrade(quizId, quizGrade);
        unitGradeRepository.save(unitGrade);

        BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
        }

        log.debug("Unit grade updated from quiz");
    }
}