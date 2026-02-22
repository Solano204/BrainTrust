package com.braintrust.education.application.helpers.gradebook;

import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class GradeSyncHelper {

    private static final Logger log = LoggerFactory.getLogger(GradeSyncHelper.class);

    private final SubmissionRepository submissionRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final UnitGradeRepository unitGradeRepository;

    public GradeSyncHelper(
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

    public void syncAssignmentGrade(CourseId courseId, UserId studentId, AssignmentId assignmentId) {
        log.info("Cascade update: Assignment {} → Unit for Student {}",
                assignmentId.getValue(), studentId.getValue());

        Submission submission = submissionRepository
                .findByAssignmentAndStudent(assignmentId, studentId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new SubmissionNotFoundException("Submission not found"));

        if (submission.getGrade() == null) {
            log.warn("Submission not graded yet, skipping cascade update");
            return;
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        UnitId unitId = assignment.getUnitId();
        if (unitId == null) {
            log.warn("Assignment not associated with any unit, skipping unit grade update");
            return;
        }

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addAssignmentGrade(assignmentId, submission.getGrade());
        unitGradeRepository.save(unitGrade);

        log.info("Cascade update completed: Assignment → Unit (Gradebook NOT updated)");
    }

    public void syncQuizGrade(CourseId courseId, UserId studentId, QuizId quizId) {
        log.info("Cascade update: Quiz {} → Unit → Course for Student {}",
                quizId.getValue(), studentId.getValue());

        QuizSubmission quizSubmission = quizSubmissionRepository
                .findLatestByQuizAndStudent(quizId, studentId)
                .orElseThrow(() -> new SubmissionNotFoundException("Quiz submission not found"));

        if (quizSubmission.getGrade() == null) {
            log.warn("Quiz not graded yet, skipping cascade update");
            return;
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        UnitId unitId = quiz.getUnitId();
        if (unitId == null) {
            log.warn("Quiz not associated with any unit, skipping unit grade update");
            return;
        }

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addQuizGrade(quizId, quizSubmission.getGrade());
        unitGradeRepository.save(unitGrade);

        log.info("Cascade update completed: Quiz → Unit → Course");
    }

    public void syncUnitGrade(Gradebook gradebook, UnitId unitId, UserId studentId) {
        log.debug("Syncing unit grade to gradebook");

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseThrow(() -> new UnitGradeNotFoundException("Unit grade not found"));

        java.math.BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new java.math.BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
            log.info("Unit grade synced to gradebook");
        }
    }
}