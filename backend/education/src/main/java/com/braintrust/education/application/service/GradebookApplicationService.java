package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.application.helpers.gradebook.*;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GradebookApplicationService implements GradebookService {

    private static final Logger log = LoggerFactory.getLogger(GradebookApplicationService.class);

    private final GradebookRepository gradebookRepository;
    private final EnrollmentRepository enrollmentRepository;

    private final GradebookDtoMapper dtoMapper;
    private final GradeUpdateHelper gradeUpdateHelper;
    private final GradeSyncHelper gradeSyncHelper;
    private final TeamGradeHelper teamGradeHelper;

    public GradebookApplicationService(
            GradebookRepository gradebookRepository,
            EnrollmentRepository enrollmentRepository,
            GradebookDtoMapper dtoMapper,
            GradeUpdateHelper gradeUpdateHelper,
            GradeSyncHelper gradeSyncHelper,
            TeamGradeHelper teamGradeHelper) {
        this.gradebookRepository = gradebookRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.dtoMapper = dtoMapper;
        this.gradeUpdateHelper = gradeUpdateHelper;
        this.gradeSyncHelper = gradeSyncHelper;
        this.teamGradeHelper = teamGradeHelper;
        log.info("GradebookApplicationService initialized with refactored helpers");
    }

    @Override
    public GradebookId createGradebook(CreateGradebookCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Creating gradebook for Student {} in Course {}", studentId.getValue(), courseId.getValue());

        if (gradebookRepository.existsByCourseAndStudent(courseId, studentId)) {
            throw new GradebookAlreadyExistsException("Gradebook already exists for this student and course");
        }

        Gradebook gradebook = Gradebook.create(courseId, studentId);
        Gradebook saved = gradebookRepository.save(gradebook);

        log.info("Gradebook created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public void assignFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade, String feedback) {
        log.info("Assigning final grade {} for student {} in course {}",
                finalGrade, studentId.getValue(), courseId.getValue());

        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);
        gradebook.assignFinalGrade(finalGrade, feedback);
        gradebookRepository.save(gradebook);

        updateEnrollmentFinalGrade(courseId, studentId, finalGrade);

        log.info("Final grade assigned for course");
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

                    assignFinalGrade(courseId, studentId, finalGrade, feedback);
                    successCount++;

                    log.debug("Updated course final grade for student {}: {}",
                            studentId.getValue(), finalGrade);

                } catch (Exception e) {
                    failureCount++;
                    log.error("Failed to update final grade for student {} in course {}: {}",
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

    @Override
    public void updateGradeFromGradebook(UpdateGradeFromGradebookCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("BIDIRECTIONAL UPDATE: type={}, activity={}, student={}, score={}/{}",
                command.activityType(), command.activityId(),
                studentId.getValue(), command.earnedPoints(), command.maxPoints());

        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);

        Grade newGrade = new Grade(
                new BigDecimal(command.earnedPoints()),
                new BigDecimal(command.maxPoints())
        );

        switch (command.activityType().toUpperCase()) {
            case "ASSIGNMENT" -> gradeUpdateHelper.updateAssignmentGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            case "QUIZ" -> gradeUpdateHelper.updateQuizGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            case "UNIT" -> gradeUpdateHelper.updateUnitGradeBidirectional(
                    command, gradebook, newGrade, courseId, studentId
            );
            default -> throw new IllegalArgumentException(
                    "Unknown activity type: " + command.activityType()
            );
        }

        gradebookRepository.save(gradebook);

        log.info("Bidirectional update completed successfully");
    }

    @Override
    public void syncAssignmentGrade(CourseId courseId, UserId studentId, AssignmentId assignmentId) {
        gradeSyncHelper.syncAssignmentGrade(courseId, studentId, assignmentId);
    }

    @Override
    public void syncQuizGrade(CourseId courseId, UserId studentId, QuizId quizId) {
        gradeSyncHelper.syncQuizGrade(courseId, studentId, quizId);
    }

    @Override
    public void syncUnitGrade(CourseId courseId, UserId studentId, UnitId unitId) {
        log.debug("Syncing unit grade to gradebook");
        Gradebook gradebook = getOrCreateGradebook(courseId, studentId);
        gradeSyncHelper.syncUnitGrade(gradebook, unitId, studentId);
        gradebookRepository.save(gradebook);
        log.info("Unit grade synced to gradebook");
    }

    @Override
    public void applyTeamGradeToAllMembers(AssignmentId assignmentId, StudentGroupId groupId) {
        teamGradeHelper.applyTeamGradeToAllMembers(assignmentId, groupId);
    }

    @Override
    @Transactional(readOnly = true)
    public GradebookDTO getGradebookByStudent(CourseId courseId, UserId studentId) {
        log.debug("Fetching gradebook for Student {} in Course {}", studentId.getValue(), courseId.getValue());

        Gradebook gradebook = gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElseThrow(() -> new GradebookNotFoundException("Gradebook not found"));

        return dtoMapper.toDTO(gradebook);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradebookDTO> getGradebooksByCourse(CourseId courseId) {
        log.debug("Fetching all gradebooks for Course {}", courseId.getValue());

        return gradebookRepository.findByCourseId(courseId)
                .stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

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

    private Gradebook getOrCreateGradebook(CourseId courseId, UserId studentId) {
        return gradebookRepository.findByCourseAndStudent(courseId, studentId)
                .orElseGet(() -> {
                    log.info("Creating new gradebook for student {} in course {}",
                            studentId.getValue(), courseId.getValue());

                    boolean isEnrolled = enrollmentRepository.existsByCourseAndStudent(courseId, studentId);
                    if (!isEnrolled) {
                        log.warn("Student {} is not enrolled in course {}, creating gradebook anyway",
                                studentId.getValue(), courseId.getValue());
                    }

                    Gradebook newGradebook = Gradebook.create(courseId, studentId);
                    return gradebookRepository.save(newGradebook);
                });
    }

    private void updateEnrollmentFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade) {
        try {
            Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByCourseAndStudent(courseId, studentId);

            if (enrollmentOpt.isPresent()) {
                Enrollment enrollment = enrollmentOpt.get();

                Grade grade = new Grade(finalGrade, new BigDecimal("100"));

                enrollment.complete(grade);
                enrollmentRepository.save(enrollment);

                log.info("Enrollment final grade updated for student {} in course {}: {}",
                        studentId.getValue(), courseId.getValue(), finalGrade);
            } else {
                log.warn("No enrollment found for student {} in course {}, cannot update enrollment final grade",
                        studentId.getValue(), courseId.getValue());
            }
        } catch (Exception e) {
            log.error("Failed to update enrollment final grade for student {} in course {}: {}",
                    studentId.getValue(), courseId.getValue(), e.getMessage(), e);
        }
    }
}