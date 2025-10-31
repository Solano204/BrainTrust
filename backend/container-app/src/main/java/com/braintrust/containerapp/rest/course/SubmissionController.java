package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.SubmissionAnalyticsDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
@Slf4j // ⬅️ Enable the 'log' variable
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ------------------------------------------------------------------
    // ✅ SUBMISSION COMMANDS (CUD Operations)
    // ------------------------------------------------------------------

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // ⬅️ NEW: Set Content-Type
    public ResponseEntity<SuccessResponseDTO> submitAssignmentWithFile(
            @ModelAttribute SubmitAssignmentCommand command
    ) {
        log.info("Request to submit assignment {} by Student ID {}", command.assignmentId(), command.studentId());
        SubmissionId submissionId = submissionService.submitAssignment(command);
        log.info("Assignment submitted. Submission ID: {}", submissionId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment submitted successfully", submissionId.getValue()));
    }

    @PutMapping("/{submissionId}/grade")
    public ResponseEntity<SuccessResponseDTO> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeSubmissionCommand command
    ) {
        log.info("Grading Submission ID: {}. Score: {}", submissionId, command.maxScore());
        submissionService.gradeSubmission(command);
        log.debug("Submission ID {} graded and finalized.", submissionId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Submission graded successfully", null));
    }




    // delete this
    @PutMapping("/{submissionId}/return")
    public ResponseEntity<SuccessResponseDTO> returnSubmissionForRevision(
            @PathVariable String submissionId,
            @RequestBody ReturnSubmissionCommand command
    ) {
        log.warn("Returning Submission ID {} for revision. Reason: {}", submissionId, command.feedback());
        submissionService.returnSubmissionForRevision(command);
        log.info("Submission ID {} returned for revision.", submissionId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Submission returned for revision", null));
    }

    @PostMapping("/{submissionId}/request-ai-analysis")
    public ResponseEntity<SuccessResponseDTO> requestAIAnalysis(@PathVariable String submissionId) {
        log.info("Requesting AI analysis for Submission ID: {}", submissionId);
        submissionService.requestAIAnalysis(SubmissionId.fromString(submissionId));
        log.info("AI analysis request dispatched for Submission ID {}.", submissionId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "AI analysis requested successfully", null));
    }

    // ------------------------------------------------------------------
    // ✅ SUBMISSION QUERIES
    // ------------------------------------------------------------------

    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable String submissionId) {
        log.debug("Fetching details for Submission ID: {}", submissionId);
        SubmissionDTO submission = submissionService.getSubmissionById(SubmissionId.fromString(submissionId));
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignment(@PathVariable String assignmentId) {
        log.debug("Fetching all submissions for Assignment ID: {}", assignmentId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignment(
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudent(@PathVariable String studentId) {
        log.debug("Fetching submissions for Student ID: {}", studentId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudent(UserId.fromString(studentId));
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/student/{studentId}/latest")
    public ResponseEntity<SubmissionDTO> getLatestSubmission(
            @PathVariable String assignmentId,
            @PathVariable String studentId
    ) {
        log.debug("Fetching latest submission for Assignment {} by Student {}", assignmentId, studentId);
        Optional<SubmissionDTO> submission = submissionService.getLatestSubmission(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );

        if (submission.isEmpty()) {
            log.info("Latest submission not found for Assignment {} and Student {}.", assignmentId, studentId);
        }

        return submission.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStatus(@PathVariable String status) {
        log.debug("Fetching submissions with status: {}", status.toUpperCase());
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStatus(
                SubmissionStatus.valueOf(status.toUpperCase())
        );
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/late")
    public ResponseEntity<List<SubmissionDTO>> getLateSubmissions(@PathVariable String assignmentId) {
        log.debug("Fetching late submissions for Assignment ID: {}", assignmentId);
        List<SubmissionDTO> submissions = submissionService.getLateSubmissions(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/analytics")
    public ResponseEntity<SubmissionAnalyticsDTO> getSubmissionAnalytics(@PathVariable String assignmentId) {
        log.debug("Calculating analytics for Assignment ID: {}", assignmentId);
        SubmissionAnalyticsDTO analytics = submissionService.getSubmissionAnalytics(
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/assignment/{assignmentId}/student/{studentId}/has-submitted")
    public ResponseEntity<Boolean> hasStudentSubmitted(
            @PathVariable String assignmentId,
            @PathVariable String studentId
    ) {
        log.trace("Checking submission flag for Assignment {} and Student {}", assignmentId, studentId);
        boolean hasSubmitted = submissionService.hasStudentSubmitted(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(hasSubmitted);
    }
}