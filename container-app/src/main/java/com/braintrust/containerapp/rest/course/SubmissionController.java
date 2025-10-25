package com.braintrust.containerapp.rest.course;

// 📍 education/infrastructure/rest/SubmissionController.java

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.SubmissionAnalyticsDTO;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ✅ SUBMISSION COMMANDS

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> submitAssignment(@RequestBody SubmitAssignmentCommand command) {
        SubmissionId submissionId = submissionService.submitAssignment(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment submitted successfully", submissionId.getValue()));
    }

    @PutMapping("/{submissionId}/grade")
    public ResponseEntity<SuccessResponseDTO> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeSubmissionCommand command
    ) {
        submissionService.gradeSubmission(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Submission graded successfully", null));
    }

    @PutMapping("/{submissionId}/return")
    public ResponseEntity<SuccessResponseDTO> returnSubmissionForRevision(
            @PathVariable String submissionId,
            @RequestBody ReturnSubmissionCommand command
    ) {
        submissionService.returnSubmissionForRevision(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Submission returned for revision", null));
    }

    @PostMapping("/{submissionId}/request-ai-analysis")
    public ResponseEntity<SuccessResponseDTO> requestAIAnalysis(@PathVariable String submissionId) {
        submissionService.requestAIAnalysis(SubmissionId.fromString(submissionId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "AI analysis requested successfully", null));
    }

    // ✅ SUBMISSION QUERIES

    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable String submissionId) {
        SubmissionDTO submission = submissionService.getSubmissionById(SubmissionId.fromString(submissionId));
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignment(@PathVariable String assignmentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignment(
                AssignmentId.fromString(assignmentId)
        );
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudent(@PathVariable String studentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudent(UserId.fromString(studentId));
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/student/{studentId}/latest")
    public ResponseEntity<SubmissionDTO> getLatestSubmission(
            @PathVariable String assignmentId,
            @PathVariable String studentId
    ) {
        Optional<SubmissionDTO> submission = submissionService.getLatestSubmission(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );
        return submission.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStatus(@PathVariable String status) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStatus(
                SubmissionStatus.valueOf(status.toUpperCase())
        );
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/late")
    public ResponseEntity<List<SubmissionDTO>> getLateSubmissions(@PathVariable String assignmentId) {
        List<SubmissionDTO> submissions = submissionService.getLateSubmissions(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/analytics")
    public ResponseEntity<SubmissionAnalyticsDTO> getSubmissionAnalytics(@PathVariable String assignmentId) {
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
        boolean hasSubmitted = submissionService.hasStudentSubmitted(
                AssignmentId.fromString(assignmentId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(hasSubmitted);
    }
}