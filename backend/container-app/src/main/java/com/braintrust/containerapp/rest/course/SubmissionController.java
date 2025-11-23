package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.SubmissionAnalyticsDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionBasicDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// other imports...

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private static final Logger log =
            LoggerFactory.getLogger(SubmissionController.class);

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ------------------------------------------------------------------
    // ✅ INDIVIDUAL SUBMISSION
    // ------------------------------------------------------------------
    @PostMapping(value = "/individual", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> submitIndividualAssignment(
            @ModelAttribute SubmitAssignmentCommand command
    ) {
        log.info("Request to submit INDIVIDUAL assignment {} by Student {} with {} attachments",
                command.assignmentId(), command.studentId(),
                command.attachments() != null ? command.attachments().size() : 0);

        SubmissionId submissionId = submissionService.submitAssignment(command);

        log.info("Individual assignment submitted. Submission ID: {}", submissionId.getValue());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Individual assignment submitted successfully", submissionId.getValue()));
    }

    // ------------------------------------------------------------------
    // ✅ TEAM SUBMISSION (NEW ENDPOINT)
    // ------------------------------------------------------------------
    @PostMapping(value = "/team", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> submitTeamAssignment(
            @ModelAttribute SubmitTeamAssignmentCommand command
    ) {
        log.info("Request to submit TEAM assignment {} for Group {} with {} attachments",
                command.assignmentId(), command.groupId(),
                command.attachments() != null ? command.attachments().size() : 0);

        SubmissionId submissionId = submissionService.submitTeamAssignment(command);

        log.info("Team assignment submitted. Submission ID: {} for Group {}",
                submissionId.getValue(), command.groupId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Team assignment submitted successfully", submissionId.getValue()));
    }

    // ------------------------------------------------------------------
    // ✅ GRADE SUBMISSION (ENHANCED FOR TEAMS)
    // ------------------------------------------------------------------
    @PutMapping("/{submissionId}/grade")
    public ResponseEntity<SuccessResponseDTO> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeSubmissionCommand command
    ) {
        log.info("Grading Submission ID: {}. Score: {}", submissionId, command.maxScore());

        SubmissionId submissionIdObj = SubmissionId.fromString(submissionId);

        // Check if this is a team submission
        boolean isTeamSubmission = submissionService.isTeamSubmission(submissionIdObj);

        if (isTeamSubmission) {
            log.info("🎯 Applying team grade to all members for submission: {}", submissionId);
            submissionService.gradeTeamSubmission(command);
        } else {
            submissionService.gradeSubmission(command);
        }

        log.debug("Submission ID {} graded and finalized. (Team: {})",
                submissionId, isTeamSubmission ? "Yes" : "No");

        return ResponseEntity.ok(new SuccessResponseDTO(true,
                isTeamSubmission ? "Team submission graded and applied to all members"
                        : "Individual submission graded successfully",
                null));
    }


    // NEW: Get submissions by course with basic information
    @GetMapping("/course/{courseId}/basic")
    public ResponseEntity<List<SubmissionBasicDTO>> getSubmissionsByCourseBasic(@PathVariable String courseId) {
        log.debug("Fetching basic submissions for Course ID: {}", courseId);
        List<SubmissionBasicDTO> submissions = submissionService.getSubmissionsByCourseBasic(
                CourseId.fromString(courseId)
        );
        return ResponseEntity.ok(submissions);
    }

    /*
    @GetMapping("/team/{teamId}/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByTeamAndAssignment(
            @PathVariable String teamId,
            @PathVariable String assignmentId
    ) {
        log.debug("Fetching team submissions for Team {} and Assignment {}", teamId, assignmentId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByTeamAndAssignment(
                StudentGroupId.fromString(teamId),
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(submissions);
    }
    */

    /*
    @PostMapping("/{submissionId}/request-ai-analysis")
    public ResponseEntity<SuccessResponseDTO> requestAIAnalysis(@PathVariable String submissionId) {
        log.info("Requesting AI analysis for Submission ID: {}", submissionId);
        submissionService.requestAIAnalysis(SubmissionId.fromString(submissionId));
        log.info("AI analysis request dispatched for Submission ID {}.", submissionId);
        return ResponseEntity.ok(new SuccessResponseDTO(true,
                "AI analysis requested successfully", null));
    }
    */

    // ------------------------------------------------------------------
    // ✅ SUBMISSION QUERIES
    // ------------------------------------------------------------------

    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable String submissionId) {
        log.debug("Fetching details for Submission ID: {}", submissionId);
        SubmissionDTO submission = submissionService.getSubmissionById(
                SubmissionId.fromString(submissionId));
        return ResponseEntity.ok(submission);
    }

    /*
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignment(
            @PathVariable String assignmentId) {
        log.debug("Fetching all submissions for Assignment ID: {}", assignmentId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignment(
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(submissions);
    }
    */

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudent(
            @PathVariable String studentId) {
        log.debug("Fetching submissions for Student ID: {}", studentId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudent(
                UserId.fromString(studentId));
        return ResponseEntity.ok(submissions);
    }

    // NEW: Get submissions by student and course
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudentAndCourse(
            @PathVariable String studentId,
            @PathVariable String courseId) {
        log.debug("Fetching submissions for Student ID: {} in Course ID: {}", studentId, courseId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudentAndCourse(
                UserId.fromString(studentId),
                CourseId.fromString(courseId)
        );
        return ResponseEntity.ok(submissions);
    }

    /*
    @GetMapping("/assignment/{assignmentId}/student/{studentId}/latest")
    public ResponseEntity<SubmissionDTO> getLatestSubmission(
            @PathVariable String assignmentId,
            @PathVariable String studentId
    ) {
        log.debug("Fetching latest submission for Assignment {} by Student {}",
                assignmentId, studentId);
        Optional<SubmissionDTO> submission = submissionService.getLatestSubmission(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );

        return submission.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    */

    /*
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStatus(
            @PathVariable String status) {
        log.debug("Fetching submissions with status: {}", status.toUpperCase());
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStatus(
                SubmissionStatus.valueOf(status.toUpperCase())
        );
        return ResponseEntity.ok(submissions);
    }
    */

    /*
    @GetMapping("/assignment/{assignmentId}/late")
    public ResponseEntity<List<SubmissionDTO>> getLateSubmissions(
            @PathVariable String assignmentId) {
        log.debug("Fetching late submissions for Assignment ID: {}", assignmentId);
        List<SubmissionDTO> submissions = submissionService.getLateSubmissions(
                AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(submissions);
    }
    */

    /*
    @GetMapping("/assignment/{assignmentId}/analytics")
    public ResponseEntity<SubmissionAnalyticsDTO> getSubmissionAnalytics(
            @PathVariable String assignmentId) {
        log.debug("Calculating analytics for Assignment ID: {}", assignmentId);
        SubmissionAnalyticsDTO analytics = submissionService.getSubmissionAnalytics(
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(analytics);
    }
    */

    /*
    @GetMapping("/assignment/{assignmentId}/student/{studentId}/has-submitted")
    public ResponseEntity<Boolean> hasStudentSubmitted(
            @PathVariable String assignmentId,
            @PathVariable String studentId
    ) {
        log.trace("Checking submission flag for Assignment {} and Student {}",
                assignmentId, studentId);
        boolean hasSubmitted = submissionService.hasStudentSubmitted(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(hasSubmitted);
    }
    */

    // ------------------------------------------------------------------
    // ✅ TEAM-SPECIFIC QUERIES
    // ------------------------------------------------------------------

    /*
    @GetMapping("/team/{groupId}/assignment/{assignmentId}")
    public ResponseEntity<SubmissionDTO> getTeamSubmission(
            @PathVariable String groupId,
            @PathVariable String assignmentId
    ) {
        log.debug("Fetching team submission for Group {} in Assignment {}",
                groupId, assignmentId);

        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignment(
                AssignmentId.fromString(assignmentId));

        Optional<SubmissionDTO> teamSubmission = submissions.stream()
                .filter(s -> groupId.equals(s.teamId()))
                .findFirst();

        return teamSubmission.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    */

    // NEW: Delete submission and restart unit grade
    @DeleteMapping("/{submissionId}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable String submissionId) {
        submissionService.deleteSubmission(SubmissionId.fromString(submissionId));
        return ResponseEntity.noContent().build();
    }
}