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
// other imports...

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
    private final UserService userService; // ✅ NEW: For getting student names

    public UnitGradeApplicationService(
            UnitGradeRepository unitGradeRepository,
            SubmissionRepository submissionRepository,
            QuizSubmissionRepository quizSubmissionRepository,
            AssignmentRepository assignmentRepository,
            QuizRepository quizRepository,
            CourseRepository courseRepository,
            UserService userService) { // ✅ NEW
        this.unitGradeRepository = unitGradeRepository;
        this.submissionRepository = submissionRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.userService = userService; // ✅ NEW
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

                    // Assign final grade for each student
                    assignFinalGrade(unitId, studentId, finalGrade, feedback);
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

        // ✅ Check if we should add or update
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

        // ✅ Check if we should add or update
        if (unitGrade.hasQuizGrade(quizId)) {
            log.info("🔄 Updating existing quiz grade in unit");
        }

        unitGrade.addQuizGrade(quizId, grade);
        unitGradeRepository.save(unitGrade);

        log.info("✅ Quiz grade {} to unit. New calculated total: {}",
                unitGrade.hasQuizGrade(quizId) ? "updated" : "added",
                unitGrade.getCalculatedTotal() != null ? unitGrade.getCalculatedTotal() : "N/A");
    }

    // ✅ UPDATED: Remove methods now properly subtract grades
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

        // Store the old total and check if assignment exists
        BigDecimal oldTotal = unitGrade.getCalculatedTotal();
        boolean hadAssignment = unitGrade.hasAssignmentGrade(assignmentId);

        if (!hadAssignment) {
            log.warn("⚠️ Assignment {} not found in unit grade, nothing to remove", assignmentId.getValue());
            return;
        }

        // Remove the assignment grade (this triggers recalculation)
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

        // Store the old total and check if quiz exists
        BigDecimal oldTotal = unitGrade.getCalculatedTotal();
        boolean hadQuiz = unitGrade.hasQuizGrade(quizId);

        if (!hadQuiz) {
            log.warn("⚠️ Quiz {} not found in unit grade, nothing to remove", quizId.getValue());
            return;
        }

        // Remove the quiz grade (this triggers recalculation)
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





    // ✅ NEW: Assign final grade for unit
    @Override
    public void assignFinalGrade(UnitId unitId, UserId studentId, BigDecimal finalGrade, String feedback) {
        log.info("Assigning final grade {} for student {} in unit {}",
                finalGrade, studentId.getValue(), unitId.getValue());

        UnitGrade unitGrade = getOrCreateUnitGrade(unitId, studentId);
        unitGrade.assignFinalGrade(finalGrade, feedback);
        unitGradeRepository.save(unitGrade);

        log.info("Final grade assigned for unit");
    }

    // ✅ NEW: Get final grade for unit
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

        // ✅ FIXED: DO NOT clear existing grades - accumulate instead
        // unitGrade.clearAllGrades(); // REMOVED THIS LINE

        // Get all assignments for this unit and add their latest grades
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
                        // ✅ This will ADD or UPDATE the assignment grade, not replace all
                        unitGrade.addAssignmentGrade(assignment.getId(), submission.getGrade());
                    });
        }

        // Get all quizzes for this unit and add their latest grades
        List<Quiz> unitQuizzes = findQuizzesForUnit(unitId);
        for (Quiz quiz : unitQuizzes) {
            quizSubmissionRepository.findLatestByQuizAndStudent(quiz.getId(), studentId)
                    .filter(sub -> sub.getGrade() != null)
                    .ifPresent(submission -> {
                        log.debug("📊 Adding quiz grade for {}: {}/{}",
                                quiz.getId().getValue(),
                                submission.getGrade().getValue(),
                                submission.getGrade().getMaxScore());
                        // ✅ This will ADD or UPDATE the quiz grade, not replace all
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
        // This depends on your Assignment-Unit relationship
        return List.of();
    }

    private List<Quiz> findQuizzesForUnit(UnitId unitId) {
        // TODO: Implement logic to find quizzes belonging to a unit
        // This depends on your Quiz-Unit relationship
        return List.of();
    }

    // ✅ UPDATED: Map to DTO with new simplified structure
    // ✅ UPDATED: Map to DTO with actual student names
    // ✅ UPDATED: Map to DTO with real student names

    // ✅ UPDATED: Map to DTO with real student names
    // ✅ UPDATED: Map to DTO with real student and unit names
    private UnitGradeDTO mapToDTO(UnitGrade unitGrade) {
        // Use display grade value (final if assigned, otherwise calculated)
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

        // ✅ FIXED: Get real student name from UserService
        MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(unitGrade.getStudentId());
        String studentName = studentInfo != null ? studentInfo.fullName() : "Unknown Student";

        // ✅ FIXED: Get real unit name from CourseRepository
        String unitName = getUnitName(unitGrade.getUnitId());

        return new UnitGradeDTO(
                unitGrade.getId().getValue(),
                unitGrade.getUnitId().getValue(),
                unitName, // ✅ REAL unit name
                unitGrade.getStudentId().getValue(),
                studentName, // ✅ REAL student name
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

    // ✅ FIXED: Get real unit name from CourseRepository
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