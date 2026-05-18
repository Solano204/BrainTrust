package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.application.ports.in.*;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserBasicInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class UnitGradeApplicationService implements UnitGradeService {

    private static final Logger log =
            LoggerFactory.getLogger(UnitGradeApplicationService.class);

    private final UnitGradeRepository unitGradeRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final UserService userService;
    // Add these new dependencies to the constructor
    private final GradebookRepository gradebookRepository;

    public UnitGradeApplicationService(
            UnitGradeRepository unitGradeRepository,
            SubmissionRepository submissionRepository,
            QuizSubmissionRepository quizSubmissionRepository,
            AssignmentRepository assignmentRepository,
            QuizRepository quizRepository,
            CourseRepository courseRepository,
            UserService userService,
            GradebookRepository gradebookRepository) {  // NEW
        this.unitGradeRepository = unitGradeRepository;
        this.submissionRepository = submissionRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.gradebookRepository = gradebookRepository;

        this.userService = userService;
    }


    @Override
    public void bulkUpdateUnitGrades(BulkUpdateUnitGradesCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());

        log.info("Bulk updating grades for {} students in unit {}",
                command.grades().size(), unitId.getValue());

        try {
            int successCount = 0;
            int failureCount = 0;

            for (UpdateStudentGradeCommand gradeCommand : command.grades()) {
                try {
                    UserId studentId = UserId.fromString(gradeCommand.studentId());
                    BigDecimal finalGrade = new BigDecimal(gradeCommand.gradeValue());
                    String feedback = gradeCommand.feedback();

                    CourseId courseId = CourseId.fromString("COURSE-js");
                    assignFinalGrade(unitId, studentId, finalGrade, feedback, courseId);
                    successCount++;

                    log.debug("✅ Updated unit grade for student {}: {}",
                            studentId.getValue(), finalGrade);

                } catch (Exception e) {
                    failureCount++;
                    log.error("❌ Failed to update grade for student {} in unit {}: {}",
                            gradeCommand.studentId(), unitId.getValue(), e.getMessage());
                }
            }

            log.info("Bulk unit grade update completed: {} succeeded, {} failed",
                    successCount, failureCount);

            if (failureCount > 0) {
                throw new RuntimeException(String.format(
                        "Bulk update partially failed: %d succeeded, %d failed",
                        successCount, failureCount));
            }

        } catch (Exception e) {
            log.error("Failed to bulk update unit grades for unit {}: {}",
                    unitId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to bulk update unit grades", e);
        }
    }

    @Override
    public void addAssignmentGradeToUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId, Grade grade) {
        log.info("➕ Adding assignment grade to unit {} for student {}: {}/{}",
                unitId.getValue(), studentId.getValue(), grade.getValue(), grade.getMaxScore());

        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);

        if (unitGrade.hasAssignmentGrade(assignmentId)) {
            log.info("🔄 Updating existing assignment grade in unit");
        }

        unitGrade.addAssignmentGrade(assignmentId, grade);
        unitGradeRepository.save(unitGrade);

        log.info("✅ Assignment grade {} to unit. New calculated total: {}",
                unitGrade.hasAssignmentGrade(assignmentId) ? "updated" : "added",
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal() : "N/A");
    }

    @Override
    public void addQuizGradeToUnit(UnitId unitId, UserId studentId, QuizId quizId, Grade grade) {
        log.info("➕ Adding quiz grade to unit {} for student {}: {}/{}",
                unitId.getValue(), studentId.getValue(), grade.getValue(), grade.getMaxScore());

        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);

        if (unitGrade.hasQuizGrade(quizId)) {
            log.info("🔄 Updating existing quiz grade in unit");
        }

        unitGrade.addQuizGrade(quizId, grade);
        unitGradeRepository.save(unitGrade);

        log.info("✅ Quiz grade {} to unit. New calculated total: {}",
                unitGrade.hasQuizGrade(quizId) ? "updated" : "added",
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal() : "N/A");
    }

    @Override
    public void removeAssignmentGradeFromUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId) {
        log.info("➖ Removing assignment grade from unit {} for student {} (Assignment: {})",
                unitId.getValue(), studentId.getValue(), assignmentId.getValue());

        UnitGrade unitGrade = unitGradeRepository.findByUnitAndStudent(unitId, studentId)
                .orElse(null);

        if (unitGrade == null) {
            log.warn("⚠️ No unit grade found for student {} in unit {}, nothing to remove",
                    studentId.getValue(), unitId.getValue());
            return;
        }

        BigDecimal oldTotal = unitGrade.getCalculatedTotal();
        boolean hadAssignment = unitGrade.hasAssignmentGrade(assignmentId);

        if (!hadAssignment) {
            log.warn("⚠️ Assignment {} not found in unit grade, nothing to remove", assignmentId.getValue());
            return;
        }

        unitGrade.removeAssignmentGrade(assignmentId);
        unitGradeRepository.save(unitGrade);

        BigDecimal newTotal = unitGrade.getCalculatedTotal();

        log.info("✅ Assignment grade removed from unit. Total changed: {} → {}",
                oldTotal != null ? oldTotal : "N/A",
                newTotal != null ? newTotal : "N/A");
    }

    @Override
    public void removeQuizGradeFromUnit(UnitId unitId, UserId studentId, QuizId quizId) {
        log.info("➖ Removing quiz grade from unit {} for student {} (Quiz: {})",
                unitId.getValue(), studentId.getValue(), quizId.getValue());

        UnitGrade unitGrade = unitGradeRepository.findByUnitAndStudent(unitId, studentId)
                .orElse(null);

        if (unitGrade == null) {
            log.warn("⚠️ No unit grade found for student {} in unit {}, nothing to remove",
                    studentId.getValue(), unitId.getValue());
            return;
        }

        BigDecimal oldTotal = unitGrade.getCalculatedTotal();
        boolean hadQuiz = unitGrade.hasQuizGrade(quizId);

        if (!hadQuiz) {
            log.warn("⚠️ Quiz {} not found in unit grade, nothing to remove", quizId.getValue());
            return;
        }

        unitGrade.removeQuizGrade(quizId);
        unitGradeRepository.save(unitGrade);

        BigDecimal newTotal = unitGrade.getCalculatedTotal();

        log.info("✅ Quiz grade removed from unit. Total changed: {} → {}",
                oldTotal != null ? oldTotal : "N/A",
                newTotal != null ? newTotal : "N/A");
    }

    @Override
    public void addFeedback(AddUnitGradeFeedbackCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Adding feedback to unit grade for student {} in unit {}",
                studentId.getValue(), unitId.getValue());

        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);
        unitGrade.setFinalFeedback(command.feedback());
        unitGradeRepository.save(unitGrade);

        log.info("Feedback added");
    }

    @Override
    public void assignFinalGrade(UnitId unitId, UserId studentId, BigDecimal finalGrade, String feedback, CourseId courseId) {
        log.info("Assigning final grade {} for student {} in unit {}",
                finalGrade, studentId.getValue(), unitId.getValue());

        // 1. Save the unit final grade
        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);
        unitGrade.assignFinalGrade(finalGrade, feedback);
        unitGradeRepository.save(unitGrade);
        log.info("Final grade assigned for unit");

        // 2. If courseId provided, recalculate and update the Gradebook
        if (courseId != null) {
            recalculateCourseGradebook(courseId, studentId);
        }
    }

    private void recalculateCourseGradebook(CourseId courseId, UserId studentId) {
        log.info("Recalculating gradebook average for student {} in course {}",
                studentId.getValue(), courseId.getValue());

        List<UnitGrade> unitGrades = unitGradeRepository.findByCourseAndStudent(courseId, studentId);

        if (unitGrades.isEmpty()) {
            log.warn("No unit grades found for student {} in course {}, skipping gradebook update",
                    studentId.getValue(), courseId.getValue());
            return;
        }

        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;

        for (UnitGrade ug : unitGrades) {
            BigDecimal value = ug.getDisplayGradeValue();
            if (value != null) {
                sum = sum.add(value);
                count++;
            }
        }

        if (count == 0) {
            log.warn("All unit grades are null for student {} in course {}, skipping",
                    studentId.getValue(), courseId.getValue());
            return;
        }

        // ✅ This is the correct average: (66 + 55) / 2 = 60.5
        BigDecimal average = sum.divide(BigDecimal.valueOf(count), 2, java.math.RoundingMode.HALF_UP);

        log.info("Computed course average: {} / {} units = {}", sum, count, average);

        Gradebook gradebook = gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElseGet(() -> {
                    log.info("Creating gradebook for student {} in course {}",
                            studentId.getValue(), courseId.getValue());
                    return Gradebook.create(courseId, studentId);
                });

        // ✅ Use the computed average directly — NOT updateCalculatedTotal(unitGrades)
        gradebook.setCalculatedTotalDirect(average);

        gradebookRepository.save(gradebook);

        log.info("Gradebook updated with average {} for student {} in course {}",
                average, studentId.getValue(), courseId.getValue());
    }

    @Override
    @Transactional(readOnly = true)
    public FinalGradeDTO getFinalGrade(UnitId unitId, UserId studentId) {
        UnitGrade unitGrade = unitGradeRepository.findByUnitAndStudent(unitId, studentId)
                .orElse(null);

        if (unitGrade == null) {
            return new FinalGradeDTO(null, null, null, null);
        }

        return new FinalGradeDTO(
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal().toString() : null,
                unitGrade.getFinalGrade() != null ? unitGrade.getFinalGrade().toString() : null,
                unitGrade.getFinalFeedback(),
                unitGrade.getLastCalculated().toString()
        );
    }

    @Override
    public void recalculateUnitGrade(UnitId unitId, UserId studentId) {
        log.info("🔄 Recalculating unit grade for student {} in unit {}",
                studentId.getValue(), unitId.getValue());

        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);

        List<Assignment> unitAssignments = findAssignmentsForUnit(unitId);
        for (Assignment assignment : unitAssignments) {
            List<Submission> submissions = submissionRepository
                    .findByAssignmentAndStudent(assignment.getId(), studentId);

            submissions.stream()
                    .filter(Submission::isGraded)
                    .findFirst()
                    .ifPresent(submission -> {
                        log.debug("📝 Adding assignment grade for {}: {}/{}",
                                assignment.getId().getValue(),
                                submission.getGrade().getValue(),
                                submission.getGrade().getMaxScore());

                        unitGrade.addAssignmentGrade(assignment.getId(), submission.getGrade());
                    });
        }

        List<Quiz> unitQuizzes = findQuizzesForUnit(unitId);
        for (Quiz quiz : unitQuizzes) {
            quizSubmissionRepository.findLatestByQuizAndStudent(quiz.getId(), studentId)
                    .filter(sub -> sub.getGrade() != null)
                    .ifPresent(submission -> {
                        log.debug("📊 Adding quiz grade for {}: {}/{}",
                                quiz.getId().getValue(),
                                submission.getGrade().getValue(),
                                submission.getGrade().getMaxScore());

                        unitGrade.addQuizGrade(quiz.getId(), submission.getGrade());
                    });
        }

        unitGradeRepository.save(unitGrade);

        log.info("✅ Unit grade recalculated for student {} in unit {}. Calculated total: {}",
                studentId.getValue(), unitId.getValue(),
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal() : "N/A");
    }


    @Override
    @Transactional(readOnly = true)
    public UnitGradeDTO getUnitGrade(UnitId unitId, UserId studentId) {
        UnitGrade unitGrade = unitGradeRepository.findByUnitAndStudent(unitId, studentId)
                .orElse(null);

        if (unitGrade == null) {
            return null;
        }

        return mapToDTO(unitGrade);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitGradeDTO> getUnitGradesByStudent(UserId studentId) {
        return unitGradeRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitGradeDTO> getUnitGradesByUnit(UnitId unitId) {
        return unitGradeRepository.findByUnitId(unitId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private UnitGrade getOrCreateUnitGrade(UnitId unitId, UserId studentId) {
        return unitGradeRepository.findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> {
                    log.info("Creating new unit grade for student {} in unit {}",
                            studentId.getValue(), unitId.getValue());
                    UnitGrade newGrade = UnitGrade.create(unitId, studentId);
                    return unitGradeRepository.save(newGrade);
                });
    }

    private List<Assignment> findAssignmentsForUnit(UnitId unitId) {
        // TODO: Implement logic to find assignments belonging to a unit
        return List.of();
    }

    private List<Quiz> findQuizzesForUnit(UnitId unitId) {
        // TODO: Implement logic to find quizzes belonging to a unit
        return List.of();
    }

    private UnitGradeDTO mapToDTO(UnitGrade unitGrade) {
        BigDecimal displayGradeValue = unitGrade.getDisplayGradeValue();

        GradeDTO gradeDTO = displayGradeValue != null
                ? new GradeDTO(
                displayGradeValue.toString(),
                "100",
                displayGradeValue.toString() + "%"
        )
                : null;

        Map<String, GradeDTO> assignmentGrades = unitGrade.getAssignmentGrades().entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().getValue(),
                        e -> new GradeDTO(
                                e.getValue().getValue().toString(),
                                e.getValue().getMaxScore().toString(),
                                e.getValue().getPercentage().toString()
                        )
                ));

        Map<String, GradeDTO> quizGrades = unitGrade.getQuizGrades().entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().getValue(),
                        e -> new GradeDTO(
                                e.getValue().getValue().toString(),
                                e.getValue().getMaxScore().toString(),
                                e.getValue().getPercentage().toString()
                        )
                ));


        MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(unitGrade.getStudentId());
        String studentName = studentInfo != null ? studentInfo.fullName() : "Unknown Student";

        String unitName = getUnitName(unitGrade.getUnitId());

        return new UnitGradeDTO(
                unitGrade.getId().getValue(),
                unitGrade.getUnitId().getValue(),
                unitName,
                unitGrade.getStudentId().getValue(),
                studentName,
                gradeDTO,
                assignmentGrades,
                quizGrades,
                unitGrade.getFinalFeedback() != null ? unitGrade.getFinalFeedback() : unitGrade.getFinalFeedback(),
                unitGrade.getLastCalculated().toString(),
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal().toString() : null,
                unitGrade.getFinalGrade() != null ? unitGrade.getFinalGrade().toString() : null,
                unitGrade.getFinalFeedback()
        );
    }

    private String getUnitName(UnitId unitId) {
        try {
            log.debug("🔍 Resolving unit name for Unit ID: {}", unitId.getValue());

            Course course = courseRepository.findByUnitId(unitId)
                    .orElseThrow(() -> {
                        log.warn("❌ Course not found for unit ID: {}", unitId.getValue());
                        return new CourseNotFoundException("Course not found for unit: " + unitId.getValue());
                    });

            String unitName = course.getUnits().stream()
                    .filter(unit -> unit.getId().equals(unitId))
                    .findFirst()
                    .map(CourseUnit::getName)
                    .orElseThrow(() -> {
                        log.warn("❌ Unit not found in course: {}", unitId.getValue());
                        return new IllegalStateException("Unit not found: " + unitId.getValue());
                    });

            log.debug("✅ Resolved unit name '{}' for Unit ID: {}", unitName, unitId.getValue());
            return unitName;

        } catch (CourseNotFoundException e) {
            log.warn("⚠️ Could not resolve unit name for unit ID {}: Course not found",
                    unitId.getValue());
            return "Unit Not Found";
        } catch (Exception e) {
            log.warn("⚠️ Could not resolve unit name for unit ID {}: {}",
                    unitId.getValue(), e.getMessage());
            return "Unit";
        }
    }
}