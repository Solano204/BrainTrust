package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
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


    @PostMapping(value = "/individual/frontend", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SubmissionDTO> submitIndividualAssignmentFrontend(
            @RequestBody SubmitAssignmentFrontendDTO command
    ) {
        log.info("Frontend extraction - Assignment {} by Student {} with {} documents",
                command.assignmentId(), command.studentId(),
                command.frontendDocuments() != null ? command.frontendDocuments().size() : 0);

        SubmissionId submissionId = submissionService.submitAssignmentFrontend(command);
        SubmissionDTO createdSubmission = submissionService.getSubmissionById(submissionId);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubmission);
    }

    @PostMapping(value = "/team/frontend", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SubmissionDTO> submitTeamAssignmentFrontend(
            @RequestBody SubmitTeamAssignmentFrontendDTO command
    ) {
        log.info("Team frontend extraction - Assignment {} by Group {} with {} documents",
                command.assignmentId(), command.groupId(),
                command.frontendDocuments() != null ? command.frontendDocuments().size() : 0);

        SubmissionId submissionId = submissionService.submitTeamAssignmentFrontend(command);
        SubmissionDTO createdSubmission = submissionService.getSubmissionById(submissionId);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubmission);
    }

    @PostMapping(value = "/individual", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionDTO> submitIndividualAssignment(
            @ModelAttribute SubmitAssignmentCommand command
    ) {
        log.info("Request to submit INDIVIDUAL assignment {} by Student {} with {} attachments",
                command.assignmentId(), command.studentId(),
                command.attachments() != null ? command.attachments().size() : 0);

        SubmissionId submissionId = submissionService.submitAssignment(command);
        SubmissionDTO createdSubmission = submissionService.getSubmissionById(submissionId);

        log.info("Individual assignment submitted. Submission ID: {}", submissionId.getValue());

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubmission);
    }

    @PostMapping(value = "/team", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionDTO> submitTeamAssignment(
            @ModelAttribute SubmitTeamAssignmentCommand command
    ) {
        log.info("Request to submit TEAM assignment {} for Group {} with {} attachments",
                command.assignmentId(), command.groupId(),
                command.attachments() != null ? command.attachments().size() : 0);

        SubmissionId submissionId = submissionService.submitTeamAssignment(command);
        SubmissionDTO createdSubmission = submissionService.getSubmissionById(submissionId);

        log.info("Team assignment submitted. Submission ID: {} for Group {}",
                submissionId.getValue(), command.groupId());

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubmission);
    }

    @PutMapping("/{submissionId}/grade")
    public ResponseEntity<SubmissionDTO> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeSubmissionCommand command
    ) {
        log.info("Grading Submission ID: {}. Score: {}", submissionId, command.maxScore());

        if (!submissionId.equals(command.submissionId())) {
            throw new IllegalArgumentException("Submission ID mismatch");
        }

        SubmissionId submissionIdObj = SubmissionId.fromString(submissionId);

        boolean isTeamSubmission = submissionService.isTeamSubmission(submissionIdObj);

        if (isTeamSubmission) {
            log.info("🎯 Applying team grade to all members for submission: {}", submissionId);
            submissionService.gradeTeamSubmission(command);
        } else {
            submissionService.gradeSubmission(command);
        }

        SubmissionDTO gradedSubmission = submissionService.getSubmissionById(submissionIdObj);

        log.debug("Submission ID {} graded and finalized. (Team: {})",
                submissionId, isTeamSubmission ? "Yes" : "No");

        return ResponseEntity.ok(gradedSubmission);
    }


    @GetMapping("/course/{courseId}/unit/{unitId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByCourseAndUnit(
            @PathVariable String courseId,
            @PathVariable String unitId) {

        log.debug("Fetching submissions for Course ID: {} and Unit ID: {}", courseId, unitId);

        List<SubmissionDTO> submissions = submissionService.getSubmissionsByCourseAndUnit(
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );

        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/{studentId}/course/{courseId}/unit/{unitId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudentAndCourseAndUnit(
            @PathVariable String studentId,
            @PathVariable String courseId,
            @PathVariable String unitId) {

        log.debug("Fetching submissions for Student: {}, Course: {}, Unit: {}",
                studentId, courseId, unitId);

        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudentAndCourseAndUnit(
                UserId.fromString(studentId),
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );

        return ResponseEntity.ok(submissions);
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

    // NEW: Delete submission and restart unit grade
    @DeleteMapping("/{submissionId}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable String submissionId) {
        submissionService.deleteSubmission(SubmissionId.fromString(submissionId));
        return ResponseEntity.noContent().build();
    }
}