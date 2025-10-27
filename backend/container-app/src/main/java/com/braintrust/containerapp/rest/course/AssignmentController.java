package com.braintrust.containerapp.rest.course;

// 📍 education/infrastructure/rest/AssignmentController.java

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ✅ ASSIGNMENT COMMANDS

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createAssignment(@RequestBody CreateAssignmentCommand command) {
        AssignmentId assignmentId = assignmentService.createAssignment(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment created successfully", assignmentId.getValue()));
    }

    @PostMapping("/with-attachments")
    public ResponseEntity<SuccessResponseDTO> createAssignmentWithAttachments(
            @RequestBody CreateAssignmentWithAttachmentsCommand command
    ) {
        AssignmentId assignmentId = assignmentService.createAssignmentWithAttachments(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment created successfully with attachments", assignmentId.getValue()));
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<SuccessResponseDTO> updateAssignment(
            @PathVariable String assignmentId,
            @RequestBody UpdateAssignmentCommand command
    ) {
        assignmentService.updateAssignmentDetails(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment updated successfully", null));
    }

    @PutMapping("/{assignmentId}/due-date")
    public ResponseEntity<SuccessResponseDTO> extendDueDate(
            @PathVariable String assignmentId,
            @RequestBody ExtendDueDateRequest request
    ) {
        assignmentService.extendDueDate(
                AssignmentId.fromString(assignmentId),
                LocalDateTime.parse(request.newDueDate())
        );
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Due date extended successfully", null));
    }

    @PutMapping("/{assignmentId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateAssignment(@PathVariable String assignmentId) {
        assignmentService.activateAssignment(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment activated successfully", null));
    }

    @PutMapping("/{assignmentId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateAssignment(@PathVariable String assignmentId) {
        assignmentService.deactivateAssignment(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment deactivated successfully", null));
    }

    // ✅ ASSIGNMENT QUERIES

    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable String assignmentId) {
        AssignmentDTO assignment = assignmentService.getAssignmentById(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourse(@PathVariable String courseId) {
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/active")
    public ResponseEntity<List<AssignmentDTO>> getActiveAssignmentsByCourse(@PathVariable String courseId) {
        List<AssignmentDTO> assignments = assignmentService.getActiveAssignmentsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/course/{courseId}/due-soon")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsDueSoon(
            @PathVariable String courseId,
            @RequestParam(defaultValue = "7") int daysAhead
    ) {
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsDueSoon(
                CourseId.fromString(courseId),
                daysAhead
        );
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/{assignmentId}/can-accept-submissions")
    public ResponseEntity<Boolean> canAcceptSubmissions(@PathVariable String assignmentId) {
        boolean canAccept = assignmentService.canAcceptSubmissions(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(canAccept);
    }

    @GetMapping("/{assignmentId}/attachment-count")
    public ResponseEntity<Integer> getAttachmentCount(@PathVariable String assignmentId) {
        int count = assignmentService.getAttachmentCount(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(count);
    }
}

