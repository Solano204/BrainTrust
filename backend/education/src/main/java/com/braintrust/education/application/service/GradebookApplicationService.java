package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.in.UnitGradeService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Service
@Transactional
public class GradebookApplicationService implements GradebookService {

    private static final Logger log =
            LoggerFactory.getLogger(GradebookApplicationService.class);
    private final GradebookRepository gradebookRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizRepository quizRepository;
    private final UnitGradeRepository unitGradeRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserService userService; // ✅ NEW: Add UserService
    private final UnitGradeService unitGradeService; // NEW: For restarting unit grade

    public GradebookApplicationService(
            GradebookRepository gradebookRepository,
            SubmissionRepository submissionRepository,
            QuizSubmissionRepository quizSubmissionRepository,
            QuizRepository quizRepository,
            UnitGradeRepository unitGradeRepository,
            StudentGroupRepository studentGroupRepository,
            AssignmentRepository assignmentRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            UserService userService, UnitGradeService unitGradeService) { // ✅ UPDATED
        this.gradebookRepository = gradebookRepository;
        this.submissionRepository = submissionRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.quizRepository = quizRepository;
        this.unitGradeRepository = unitGradeRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.assignmentRepository = assignmentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userService = userService; // ✅ NEW
        this.unitGradeService = unitGradeService;
    }

    // ========================================
    // 📍 COMMANDS
    // ========================================

    @Override
    public GradebookId createGradebook(CreateGradebookCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Creating gradebook for Student {} in Course {}", studentId.getValue(), courseId.getValue());

        // Check if gradebook already exists
        if (gradebookRepository.existsByCourseAndStudent(courseId, studentId)) {
            throw new GradebookAlreadyExistsException("Gradebook already exists for this student and course");
        }

        Gradebook gradebook = Gradebook.create(courseId, studentId);
        Gradebook saved = gradebookRepository.save(gradebook);

        log.info("Gradebook created: {}", saved.getId().getValue());
        return saved.getId();
    }

    // ✅ REMOVED: Weight config method (no longer needed)

    /**
     * 🎯 CRITICAL: Bidirectional grade update from Gradebook view
     */
    @Override
    public void updateGradeFromGradebook(UpdateGradeFromGradebookCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("🎯 BIDIRECTIONAL UPDATE: type={}, activity={}, student={}, score={}/{}",
                command.activityType(), command.activityId(),
                studentId.getValue(), command.earnedPoints(), command.maxPoints());

        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);

        Grade newGrade = new Grade(
                new BigDecimal(command.earnedPoints()),
                new BigDecimal(command.maxPoints())
        );

        // Update based on activity type
        switch (command.activityType().toUpperCase()) {
            case "ASSIGNMENT" -> updateAssignmentGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            case "QUIZ" -> updateQuizGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            case "UNIT" -> updateUnitGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            default -> throw new IllegalArgumentException(
                    "Unknown activity type: " + command.activityType()
            );
        }

        // Save updated gradebook
        gradebookRepository.save(gradebook);

        log.info("✅ Bidirectional update completed successfully");
    }

    // ✅ NEW: Assign final grade for course
    @Override
    public void assignFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade, String feedback) {
        log.info("Assigning final grade {} for student {} in course {}",
                finalGrade, studentId.getValue(), courseId.getValue());

        // 1. Get or create gradebook and assign final grade
        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);
        gradebook.assignFinalGrade(finalGrade, feedback);
        gradebookRepository.save(gradebook);

        // 2. ✅ NEW: Update enrollment final grade
        updateEnrollmentFinalGrade(courseId, studentId, finalGrade);

        log.info("Final grade assigned for course");
    }

    /**
     * ✅ NEW: Update enrollment with final grade
     */
    private void updateEnrollmentFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade) {
        try {
            // Find the enrollment
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByCourseAndStudent(courseId, studentId);

            if (enrollmentOpt.isPresent()) {
                Enrollment enrollment = enrollmentOpt.get();

                // Create a Grade object (assuming max score is 100 for final grades)
                Grade grade = new Grade(finalGrade, new BigDecimal("100"));

                // Complete the enrollment with the final grade
                enrollment.complete(grade);
                enrollmentRepository.save(enrollment);

                log.info("✅ Enrollment final grade updated for student {} in course {}: {}",
                        studentId.getValue(), courseId.getValue(), finalGrade);
            } else {
                log.warn("⚠️ No enrollment found for student {} in course {}, cannot update enrollment final grade",
                        studentId.getValue(), courseId.getValue());
            }
        } catch (Exception e) {
            log.error("❌ Failed to update enrollment final grade for student {} in course {}: {}",
                    studentId.getValue(), courseId.getValue(), e.getMessage(), e);
            // Don't throw - we don't want to fail the gradebook update if enrollment update fails
        }
    }

    // ✅ NEW: Get final grade for course
    @Override
    @Transactional(readOnly = true)
    public FinalGradeDTO getFinalGrade(CourseId courseId, UserId studentId) {
        Gradebook gradebook = gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElse(null);

        if (gradebook == null) {
            return new FinalGradeDTO(null, null, null, null);
        }

        return new FinalGradeDTO(
                gradebook.getCalculatedTotal() != null ? gradebook.getCalculatedTotal().toString() : null,
                gradebook.getFinalGrade() != null ? gradebook.getFinalGrade().toString() : null,
                gradebook.getFinalFeedback(),
                gradebook.getLastCalculated().toString()
        );
    }




    @Override
    public void bulkUpdateCourseGrades(BulkUpdateCourseGradesCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Bulk updating final grades for {} students in course {}",
                command.grades().size(), courseId.getValue());

        try {
            int successCount = 0;
            int failureCount = 0;

            for (UpdateStudentGradeCommand gradeCommand : command.grades()) {
                try {
                    UserId studentId = UserId.fromString(gradeCommand.studentId());
                    BigDecimal finalGrade = new BigDecimal(gradeCommand.gradeValue());
                    String feedback = gradeCommand.feedback();

                    // Assign final grade for each student
                    assignFinalGrade(courseId, studentId, finalGrade, feedback);
                    successCount++;

                    log.debug("✅ Updated course final grade for student {}: {}",
                            studentId.getValue(), finalGrade);

                } catch (Exception e) {
                    failureCount++;
                    log.error("❌ Failed to update final grade for student {} in course {}: {}",
                            gradeCommand.studentId(), courseId.getValue(), e.getMessage());
                }
            }

            log.info("Bulk course grade update completed: {} succeeded, {} failed",
                    successCount, failureCount);

            if (failureCount > 0) {
                throw new RuntimeException(String.format(
                        "Bulk update partially failed: %d succeeded, %d failed",
                        successCount, failureCount));
            }

        } catch (Exception e) {
            log.error("Failed to bulk update course grades for course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to bulk update course grades", e);
        }
    }

    /**
     * Update assignment grade + source submission
     */
    private void updateAssignmentGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        AssignmentId assignmentId = AssignmentId.fromString(command.activityId());

        log.debug("📝 Updating assignment grade bidirectionally");

        // 1. Find and update source submission
        List<Submission> submissions = submissionRepository
                .findByAssignmentAndStudent(assignmentId, studentId);

        if (submissions.isEmpty()) {
            log.warn("⚠️ No submission found for assignment {}, creating placeholder",
                    assignmentId.getValue());

            // Create a placeholder submission (for cases where grade is entered before submission)
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
            // Update existing submission
            Submission submission = submissions.get(0);
            submission.grade(newGrade, command.feedback());
            submissionRepository.save(submission);

            log.debug("✅ Source submission updated");
        }

        // 2. Trigger cascade update to unit (if assignment belongs to a unit)
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

    /**
     * Update quiz grade + source quiz submission
     */
    private void updateQuizGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        QuizId quizId = QuizId.fromString(command.activityId());

        log.debug("📝 Updating quiz grade bidirectionally");

        // 1. Find and update source quiz submission
        QuizSubmission quizSubmission = quizSubmissionRepository
                .findLatestByQuizAndStudent(quizId, studentId)
                .orElseThrow(() -> new SubmissionNotFoundException(
                        "Quiz submission not found for quiz " + quizId.getValue()
                ));

        // Update the quiz submission grade
        quizSubmission.manualGrade(
                newGrade.getValue().intValue(),
                newGrade.getMaxScore().intValue()
        );
        quizSubmissionRepository.save(quizSubmission);

        log.debug("✅ Source quiz submission updated");

        // 2. Trigger cascade update to unit (if quiz belongs to a unit)
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

    /**
     * Update unit grade (and add feedback)
     */
    private void updateUnitGradeBidirectional(
            UpdateGradeFromGradebookCommand command,
            Gradebook gradebook,
            Grade newGrade,
            CourseId courseId,
            UserId studentId) {

        UnitId unitId = UnitId.fromString(command.activityId());

        log.warn("⚠️ Unit grades are auto-calculated. Only updating feedback.");

        // Update unit grade feedback
        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.setFinalFeedback(command.feedback());
        unitGradeRepository.save(unitGrade);
    }

    /**
     * Helper: Update unit grade when an assignment is graded
     */
    private void updateUnitGradeForAssignment(
            UnitId unitId,
            AssignmentId assignmentId,
            UserId studentId,
            Grade assignmentGrade,
            Gradebook gradebook) {

        log.debug("🔄 Cascading assignment grade to unit {}", unitId.getValue());

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        // Add/update assignment grade in unit
        unitGrade.addAssignmentGrade(assignmentId, assignmentGrade);
        unitGradeRepository.save(unitGrade);

        // ✅ FIXED: Update unit grade in gradebook using the new method
        BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            // Create a simple grade for the unit with max score 100
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
        }
    }

    /**
     * Helper: Update unit grade when a quiz is graded
     */
    private void updateUnitGradeForQuiz(
            UnitId unitId,
            QuizId quizId,
            UserId studentId,
            Grade quizGrade,
            Gradebook gradebook) {

        log.debug("🔄 Cascading quiz grade to unit {}", unitId.getValue());

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        // Add/update quiz grade in unit
        unitGrade.addQuizGrade(quizId, quizGrade);
        unitGradeRepository.save(unitGrade);

        // ✅ FIXED: Update unit grade in gradebook using the new method
        BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
        }

        log.debug("✅ Unit grade updated from quiz");
    }



    /**
     * 🎯 Called by UnitGradeService when unit is recalculated
     */
    @Override
    public void syncUnitGrade(CourseId courseId, UserId studentId, UnitId unitId) {
        log.debug("Syncing unit grade to gradebook");

        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);

        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseThrow(() -> new UnitGradeNotFoundException("Unit grade not found"));

        // ✅ FIXED: Update unit grade in gradebook using the new method
        BigDecimal unitDisplayValue = unitGrade.getDisplayGradeValue();
        if (unitDisplayValue != null) {
            Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
            gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
            gradebookRepository.save(gradebook);
            log.info("Unit grade synced to gradebook");
        }
    }

    /**
     * 🎯 CRITICAL: Team grading - apply grade to ALL team members
     */
    @Override
    public void applyTeamGradeToAllMembers(AssignmentId assignmentId, StudentGroupId groupId) {
        log.info("🎯 Applying team grade to all members of group {}", groupId.getValue());

        // Get the team submission (any graded submission from the team)
        List<Submission> teamSubmissions = submissionRepository.findByAssignmentId(assignmentId)
                .stream()
                .filter(s -> s.getTeamId() != null && s.getTeamId().equals(groupId))
                .filter(Submission::isGraded)
                .collect(Collectors.toList());

        if (teamSubmissions.isEmpty()) {
            throw new SubmissionNotFoundException("No graded team submission found for group " + groupId.getValue());
        }

        // Use the first graded team submission
        Submission teamSubmission = teamSubmissions.get(0);
        Grade teamGrade = teamSubmission.getGrade();
        String teamFeedback = teamSubmission.getTeacherFeedback();

        // Get all team members
        StudentGroup group = studentGroupRepository.findById(groupId)
                .orElseThrow(() -> new StudentGroupNotFoundException("Group not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        int updatedCount = 0;

        // Apply grade to ALL team members
        for (UserId memberId : group.getMemberIds()) {
            try {
                // 1. Find or create submission for each team member
                List<Submission> memberSubmissions = submissionRepository.findByAssignmentAndStudent(
                        assignmentId, memberId);

                Submission memberSubmission;
                if (memberSubmissions.isEmpty()) {
                    // Create a submission record for team members who didn't submit individually
                    memberSubmission = Submission.create(
                            assignmentId,
                            memberId,
                            "Team submission - " + teamSubmission.getContent(),
                            teamSubmission.getAttachments(),
                            SubmissionStatus.GRADED,
                            groupId
                    );
                    log.info("📝 Created team submission record for member: {}", memberId.getValue());
                } else {
                    memberSubmission = memberSubmissions.get(0);
                }

                // 2. Apply the team grade and feedback
                memberSubmission.grade(teamGrade, "Team Grade: " + teamFeedback);
                submissionRepository.save(memberSubmission);

                // ✅ ONLY update UnitGrade (NO Gradebook modification)
                updateUnitGradeOnlyForTeamMember(assignment, memberId, assignmentId, teamGrade);

                updatedCount++;
                log.debug("✅ Team grade applied to member: {}", memberId.getValue());

            } catch (Exception e) {
                log.error("❌ Failed to apply team grade to member {}: {}",
                        memberId.getValue(), e.getMessage(), e);
                // Continue with other members
            }
        }

        log.info("✅ Team grade successfully applied to {}/{} members with UnitGrade updates only",
                updatedCount, group.getMemberCount());
    }


    // In GradebookApplicationService - update the team grading method
    private void updateUnitGradeOnlyForTeamMember(Assignment assignment,
                                                  UserId studentId,
                                                  AssignmentId assignmentId,
                                                  Grade teamGrade) {

        UnitId unitId = assignment.getUnitId();
        if (unitId == null) {
            log.debug("⚠️ Assignment {} not associated with any unit, skipping unit grade update",
                    assignmentId.getValue());
            return;
        }

        try {
            log.debug("➕ Adding team assignment grade to UnitGrade for student {} in unit {}",
                    studentId.getValue(), unitId.getValue());

            // ✅ Use the new additive method instead of full recalculation
            unitGradeService.addAssignmentGradeToUnit(
                    unitId,
                    studentId,
                    assignmentId,
                    teamGrade
            );

            log.debug("✅ Team assignment grade ADDED to UnitGrade for student {} in unit {} (not replaced)",
                    studentId.getValue(), unitId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to update UnitGrade for student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            // Don't throw - continue with other members
        }
    }




    private void updateGradebookAndUnitGradeForTeamMember(Assignment assignment,
                                                          UserId studentId,
                                                          AssignmentId assignmentId,
                                                          Grade teamGrade) {

        CourseId courseId = assignment.getCourseId();
        UnitId unitId = assignment.getUnitId();

        try {
            log.debug("🔄 Updating gradebook and unit grade for student {} in course {}",
                    studentId.getValue(), courseId.getValue());

            // 1. ✅ Ensure gradebook exists for this student in this course
            Gradebook gradebook = getOrCreateGradebook(courseId, studentId);

            // 2. ✅ If assignment belongs to a unit, update unit grade
            if (unitId != null) {
                updateUnitGradeForTeamMember(unitId, studentId, assignmentId, teamGrade, gradebook);
            }

            // 3. ✅ Save the updated gradebook
            gradebookRepository.save(gradebook);

            log.debug("✅ Gradebook and unit grade updated for student {}",
                    studentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to update gradebook for student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            // Don't throw - continue with other members
        }
    }



    private void updateUnitGradeForTeamMember(UnitId unitId,
                                              UserId studentId,
                                              AssignmentId assignmentId,
                                              Grade teamGrade,
                                              Gradebook gradebook) {

        try {
            log.debug("🔄 Updating unit grade for student {} in unit {} (from team assignment)",
                    studentId.getValue(), unitId.getValue());

            // Get or create unit grade
            UnitGrade unitGrade = unitGradeRepository
                    .findByUnitAndStudent(unitId, studentId)
                    .orElseGet(() -> UnitGrade.create(unitId, studentId));

            // Add/update assignment grade in unit
            unitGrade.addAssignmentGrade(assignmentId, teamGrade);
            UnitGrade savedUnitGrade = unitGradeRepository.save(unitGrade);

            // ✅ FIXED: Update unit grade in gradebook using the new method
            BigDecimal unitDisplayValue = savedUnitGrade.getDisplayGradeValue();
            if (unitDisplayValue != null) {
                Grade unitGradeForGradebook = new Grade(unitDisplayValue, new BigDecimal("100"));
                gradebook.updateUnitGrade(unitId, unitGradeForGradebook);
                log.debug("✅ Unit grade updated in gradebook for student {}: {}",
                        studentId.getValue(), unitDisplayValue);
            }

        } catch (Exception e) {
            log.error("❌ Failed to update unit grade for student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            throw e; // Re-throw to handle in calling method
        }
    }

    // ========================================
    // 📍 CASCADE UPDATE FLOW: Assignment/Quiz → Unit → Course
    // ========================================

    /**
     * 🎯 Called when assignment is graded - updates Unit and Course grades
     */
    @Override
    public void syncAssignmentGrade(CourseId courseId, UserId studentId, AssignmentId assignmentId) {
        log.info("Cascade update: Assignment {} → Unit for Student {}",
                assignmentId.getValue(), studentId.getValue());

        // 1. Get the graded submission
        Submission submission = submissionRepository
                .findByAssignmentAndStudent(assignmentId, studentId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new SubmissionNotFoundException("Submission not found"));

        if (submission.getGrade() == null) {
            log.warn("Submission not graded yet, skipping cascade update");
            return;
        }

        // 2. Find which unit this assignment belongs to
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        UnitId unitId = assignment.getUnitId();
        if (unitId == null) {
            log.warn("Assignment not associated with any unit, skipping unit grade update");
            return;
        }

        // 3. Update ONLY Unit Grade (NO Gradebook)
        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addAssignmentGrade(assignmentId, submission.getGrade());
        unitGradeRepository.save(unitGrade);

        log.info("Cascade update completed: Assignment → Unit (Gradebook NOT updated)");
    }

    /**
     * 🎯 Called when quiz is graded - updates Unit and Course grades
     */
    @Override
    public void syncQuizGrade(CourseId courseId, UserId studentId, QuizId quizId) {
        log.info("Cascade update: Quiz {} → Unit → Course for Student {}",
                quizId.getValue(), studentId.getValue());

        // 1. Get the graded quiz submission
        QuizSubmission quizSubmission = quizSubmissionRepository
                .findLatestByQuizAndStudent(quizId, studentId)
                .orElseThrow(() -> new SubmissionNotFoundException("Quiz submission not found"));

        if (quizSubmission.getGrade() == null) {
            log.warn("Quiz not graded yet, skipping cascade update");
            return;
        }

        // 2. Find which unit this quiz belongs to
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        UnitId unitId = quiz.getUnitId();
        if (unitId == null) {
            log.warn("Quiz not associated with any unit, skipping unit grade update");
            return;
        }

        // 3. Update Unit Grade
        UnitGrade unitGrade = unitGradeRepository
                .findByUnitAndStudent(unitId, studentId)
                .orElseGet(() -> UnitGrade.create(unitId, studentId));

        unitGrade.addQuizGrade(quizId, quizSubmission.getGrade());
        unitGradeRepository.save(unitGrade);



        log.info("Cascade update completed: Quiz → Unit → Course");
    }

    // ========================================
    // 📍 QUERIES
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public GradebookDTO getGradebookByStudent(CourseId courseId, UserId studentId) {
        log.debug("Fetching gradebook for Student {} in Course {}", studentId.getValue(), courseId.getValue());

        Gradebook gradebook = gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElseThrow(() -> new GradebookNotFoundException("Gradebook not found"));

        return mapToGradebookDTO(gradebook);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradebookDTO> getGradebooksByCourse(CourseId courseId) {
        log.debug("Fetching all gradebooks for Course {}", courseId.getValue());

        return gradebookRepository.findByCourseId(courseId)
                .stream()
                .map(this::mapToGradebookDTO)
                .collect(Collectors.toList());
    }

    // ✅ REMOVED: Complex query methods (no longer needed)
    // getGradebookSummary, getCategoryGrades, getOverallGrade

    // ========================================
    // 📍 PRIVATE HELPERS
    // ========================================

    private Gradebook getOrCreateGradebook(CourseId courseId, UserId studentId) {
        return gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElseGet(() -> {
                    log.info("📚 Creating new gradebook for student {} in course {}",
                            studentId.getValue(), courseId.getValue());

                    // Verify the student is enrolled in the course
                    boolean isEnrolled = enrollmentRepository.existsByCourseAndStudent(courseId, studentId);
                    if (!isEnrolled) {
                        log.warn("⚠️ Student {} is not enrolled in course {}, creating gradebook anyway",
                                studentId.getValue(), courseId.getValue());
                    }

                    Gradebook newGradebook = Gradebook.create(courseId, studentId);
                    return gradebookRepository.save(newGradebook);
                });
    }

    private Gradebook findGradebookByIdOrThrow(GradebookId gradebookId) {
        return gradebookRepository.findById(gradebookId)
                .orElseThrow(() -> new GradebookNotFoundException("Gradebook not found: " + gradebookId.getValue()));
    }

    // ✅ UPDATED: Map to DTO with new simplified structure
    private GradebookDTO mapToGradebookDTO(Gradebook gradebook) {
        // ✅ FIXED: Get real student name from UserService
        MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(gradebook.getStudentId());
        String studentName = studentInfo != null ? studentInfo.fullName() : "Unknown Student";

        // ✅ FIXED: Get real course name
        String courseName = getCourseName(gradebook.getCourseId());

        return new GradebookDTO(
                gradebook.getId().getValue(),
                gradebook.getCourseId().getValue(),
                courseName, // ✅ REAL course name
                gradebook.getStudentId().getValue(),
                studentName, // ✅ REAL student name
                gradebook.getLastCalculated().toString(),
                gradebook.getCalculatedTotal() != null ? gradebook.getCalculatedTotal().toString() : null,
                gradebook.getFinalGrade() != null ? gradebook.getFinalGrade().toString() : null,
                gradebook.getFinalFeedback()
        );
    }

    // ✅ NEW: Helper method to get course name
    private String getCourseName(CourseId courseId) {
        try {
            // Use your existing course repository to get the course name
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new CourseNotFoundException("Course not found"));
            return course.getName(); // Assuming your Course domain has getName() method
        } catch (Exception e) {
            log.warn("Could not resolve course name for course ID: {}", courseId.getValue());
            return "Course";
        }
    }


    private GradeDTO mapToGradeDTO(Grade grade) {
        return new GradeDTO(
                grade.getValue().toString(),
                grade.getMaxScore().toString(),
                grade.getPercentage().toString()
        );
    }
}