package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.in.QuizSubmissionService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.commands.AssignFinalGradeCommand;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 🎯 Simplified Gradebook Controller with Final Grade Assignment
 */
@RestController
@RequestMapping("/api/gradebook")
@CrossOrigin(origins = "*")
public class GradebookController {
    private static final Logger log =
            LoggerFactory.getLogger(GradebookController.class);
    private final GradebookService gradebookService;
    private final SubmissionService submissionService;
    private final QuizSubmissionService quizSubmissionService;

    public GradebookController(GradebookService gradebookService, SubmissionService submissionService, QuizSubmissionService quizSubmissionService) {
        this.gradebookService = gradebookService;
        this.submissionService = submissionService;
        this.quizSubmissionService = quizSubmissionService;
    }

    // ========================================
    // 📍 FINAL GRADE MANAGEMENT
    // ========================================

    @PutMapping("/course/{courseId}/student/{studentId}/final-grade")
    public ResponseEntity<Void> assignFinalGrade(
            @PathVariable String courseId,
            @PathVariable String studentId,
            @RequestBody AssignFinalGradeCommand command) {

        log.info("🎯 Assigning final grade for student {} in course {}: {}",
                studentId, courseId, command.gradeValue());

        gradebookService.assignFinalGrade(
                CourseId.fromString(courseId),
                UserId.fromString(studentId),
                new BigDecimal(command.gradeValue()),
                command.feedback()
        );

        return ResponseEntity.ok().build();
    }

//    @GetMapping("/course/{courseId}/student/{studentId}/final-grade")
//    public ResponseEntity<FinalGradeDTO> getFinalGrade(
//            @PathVariable String courseId,
//            @PathVariable String studentId) {
//
//        FinalGradeDTO finalGrade = gradebookService.getFinalGrade(
//                CourseId.fromString(courseId),
//                UserId.fromString(studentId)
//        );
//
//        return ResponseEntity.ok(finalGrade);
//    }

    // ========================================
    // 📍 GRADEBOOK MANAGEMENT
    // ========================================
//
//    @PostMapping
//    public ResponseEntity<String> createGradebook(@RequestBody CreateGradebookCommand command) {
//        GradebookId id = gradebookService.createGradebook(command);
//        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
//    }

    // ✅ REMOVED: Weight config endpoint (no longer needed)

    // ========================================
    // 🚀 RAPID GRADE UPDATES FROM GRADEBOOK TABLE
    // ========================================

//    @PutMapping("/update-grade")
//    public ResponseEntity<GradeUpdateResponse> updateGradeFromGradebook(
//            @RequestBody UpdateGradeFromGradebookCommand command) {
//
//        log.info("🎯 Rapid grade update: type={}, activity={}, student={}, score={}/{}",
//                command.activityType(), command.activityId(),
//                command.studentId(), command.earnedPoints(), command.maxPoints());
//
//        try {
//            gradebookService.updateGradeFromGradebook(command);
//
//            log.info("✅ Grade updated successfully with bidirectional sync");
//            return ResponseEntity.ok(new GradeUpdateResponse(
//                    true,
//                    "Grade updated successfully",
//                    null
//            ));
//
//        } catch (Exception e) {
//            log.error("❌ Grade update failed: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new GradeUpdateResponse(
//                            false,
//                            "Update failed: " + e.getMessage(),
//                            null
//                    ));
//        }
//    }

//    @PutMapping("/course/{courseId}/student/{studentId}/assignment/{assignmentId}/grade")
//    public ResponseEntity<GradeUpdateResponse> updateAssignmentGradeRapid(
//            @PathVariable String courseId,
//            @PathVariable String studentId,
//            @PathVariable String assignmentId,
//            @RequestBody RapidGradeUpdateRequest request) {
//
//        log.info("📝 Rapid assignment grade: assignment={}, student={}, score={}",
//                assignmentId, studentId, request.score());
//
//        try {
//            GradeSubmissionCommand gradeCommand = new GradeSubmissionCommand(
//                    findSubmissionId(assignmentId, studentId),
//                    request.score(),
//                    request.maxScore(),
//                    request.feedback() != null ? request.feedback() : ""
//            );
//
//            submissionService.gradeSubmission(gradeCommand);
//
//            log.info("✅ Assignment grade updated and synced");
//            return ResponseEntity.ok(new GradeUpdateResponse(
//                    true,
//                    "Assignment graded successfully",
//                    assignmentId
//            ));
//
//        } catch (Exception e) {
//            log.error("❌ Assignment grade update failed: {}", e.getMessage());
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new GradeUpdateResponse(
//                            false,
//                            "Update failed: " + e.getMessage(),
//                            assignmentId
//                    ));
//        }
//    }
//
//    @PutMapping("/course/{courseId}/student/{studentId}/quiz/{quizId}/grade")
//    public ResponseEntity<GradeUpdateResponse> updateQuizGradeRapid(
//            @PathVariable String courseId,
//            @PathVariable String studentId,
//            @PathVariable String quizId,
//            @RequestBody RapidGradeUpdateRequest request) {
//
//        log.info("📝 Rapid quiz grade: quiz={}, student={}, score={}",
//                quizId, studentId, request.score());
//
//        try {
//            GradeQuizSubmissionCommand gradeCommand = new GradeQuizSubmissionCommand(
//                    findQuizSubmissionId(quizId, studentId),
//                    Integer.parseInt(request.score()),
//                    Integer.parseInt(request.maxScore())
//            );
//
//            quizSubmissionService.gradeQuizSubmission(gradeCommand);
//
//            log.info("✅ Quiz grade updated and synced");
//            return ResponseEntity.ok(new GradeUpdateResponse(
//                    true,
//                    "Quiz graded successfully",
//                    quizId
//            ));
//
//        } catch (Exception e) {
//            log.error("❌ Quiz grade update failed: {}", e.getMessage());
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new GradeUpdateResponse(
//                            false,
//                            "Update failed: " + e.getMessage(),
//                            quizId
//                    ));
//        }
//    }

//    @PostMapping("/course/{courseId}/batch-update")
//    public ResponseEntity<BatchGradeUpdateResponse> batchUpdateGrades(
//            @PathVariable String courseId,
//            @RequestBody BatchGradeUpdateRequest request) {
//
//        log.info("🔄 Batch grade update: {} items for course {}",
//                request.updates().size(), courseId);
//
//        int successCount = 0;
//        int failureCount = 0;
//        List<String> errors = new ArrayList<>();
//
//        for (RapidBatchGradeUpdate update : request.updates()) {
//            try {
//                UpdateGradeFromGradebookCommand command = new UpdateGradeFromGradebookCommand(
//                        null,
//                        courseId,
//                        update.studentId(),
//                        update.activityType(),
//                        update.activityId(),
//                        update.score(),
//                        update.maxScore(),
//                        update.feedback()
//                );
//
//                gradebookService.updateGradeFromGradebook(command);
//                successCount++;
//
//                log.debug("✅ Batch item updated: {} for student {}",
//                        update.activityId(), update.studentId());
//
//            } catch (Exception e) {
//                failureCount++;
//                String error = String.format("Failed %s %s for student %s: %s",
//                        update.activityType(), update.activityId(),
//                        update.studentId(), e.getMessage());
//                errors.add(error);
//                log.error("❌ {}", error);
//            }
//        }
//
//        log.info("✅ Batch update complete: {} succeeded, {} failed",
//                successCount, failureCount);
//
//        return ResponseEntity.ok(new BatchGradeUpdateResponse(
//                successCount,
//                failureCount,
//                errors
//        ));
//    }

    // ========================================
    // 📍 GRADEBOOK QUERIES
    // ========================================

    @GetMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<GradebookDTO> getGradebookByStudent(
            @PathVariable String courseId,
            @PathVariable String studentId) {

        GradebookDTO dto = gradebookService.getGradebookByStudent(
                CourseId.fromString(courseId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(dto);
    }


    @PutMapping("/course/{courseId}/bulk-grades")
    public ResponseEntity<SuccessResponseDTO> bulkUpdateCourseGrades(
            @PathVariable String courseId,
            @RequestBody BulkUpdateCourseGradesCommand command) {

        log.info("Bulk updating grades for {} students in course {}",
                command.grades().size(), courseId);

        // Ensure the courseId in path matches the command
        BulkUpdateCourseGradesCommand finalCommand = new BulkUpdateCourseGradesCommand(
                courseId,
                command.grades()
        );

        gradebookService.bulkUpdateCourseGrades(finalCommand);

        return ResponseEntity.ok(new SuccessResponseDTO(
                true,
                String.format("Bulk updated %d grades for course %s",
                        command.grades().size(), courseId),
                null
        ));
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<GradebookDTO>> getGradebooksByCourse(
            @PathVariable String courseId) {

        log.debug("📊 Fetching gradebook table for course {}", courseId);

        List<GradebookDTO> gradebooks = gradebookService.getGradebooksByCourse(
                CourseId.fromString(courseId)
        );

        log.info("✅ Retrieved {} student gradebooks", gradebooks.size());
        return ResponseEntity.ok(gradebooks);
    }

    // ✅ REMOVED: Complex query endpoints (no longer needed)
    // getGradebookSummary, getCategoryGrades, getOverallGrade

    // ========================================
    // 📍 HELPER METHODS
    // ========================================

//    private String findSubmissionId(String assignmentId, String studentId) {
//        SubmissionDTO submission = submissionService.getLatestSubmission(
//                AssignmentId.fromString(assignmentId),
//                UserId.fromString(studentId)
//        ).orElseThrow(() -> new RuntimeException("Submission not found"));
//
//        return submission.id();
//    }
//
//    private String findQuizSubmissionId(String quizId, String studentId) {
//        QuizSubmissionDTO submission = quizSubmissionService.getLatestSubmission(
//                QuizId.fromString(quizId),
//                UserId.fromString(studentId)
//        );
//
//        if (submission == null) {
//            throw new RuntimeException("Quiz submission not found");
//        }
//
//        return submission.id();
//    }
}