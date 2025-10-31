package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j; // ⬅️ Import Slf4j annotation
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
@Slf4j // ⬅️ Enable the 'log' variable for logging
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT COMMANDS (CUD Operations)
    // ------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createAssignment(@RequestBody CreateAssignmentCommand command) {
        log.info("Request to create new assignment for Course ID: {}", command.courseId());
        AssignmentId assignmentId = assignmentService.createAssignment(command);
        log.info("Assignment created successfully with ID: {}", assignmentId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment created successfully", assignmentId.getValue()));
    }

    @Operation(summary = "Create Assignment with File Attachments",
            description = "Creates a new assignment and uploads multiple files for instructions/resources.")
    // ⬅️ CRITICAL CHANGE: Use consumes = multipart/form-data
    @PostMapping(value = "/with-attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> createAssignmentWithAttachments(
            // ⬅️ CRITICAL CHANGE: Use @ModelAttribute to bind files and text fields
            @ModelAttribute CreateAssignmentWithAttachmentsCommand command
    ) {
        log.info("Request to create assignment with {} attachments for Course ID: {}",
                command.attachments().size(), command.courseId());

        // ⚠️ The service method signature MUST be updated to accept the new command,
        // as it now handles the List<MultipartFile>.
        AssignmentId assignmentId = assignmentService.createAssignmentWithAttachments(command);

        log.info("Assignment created with attachments. ID: {}", assignmentId.getValue());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Assignment created successfully with attachments", assignmentId.getValue()));
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<SuccessResponseDTO> updateAssignment(
            @PathVariable String assignmentId,
            @RequestBody UpdateAssignmentCommand command
    ) {
        log.info("Request to update assignment details for ID: {}", assignmentId);
        assignmentService.updateAssignmentDetails(command);
        log.debug("Assignment ID {} details updated.", assignmentId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment updated successfully", null));
    }

    @PutMapping("/{assignmentId}/due-date")
    public ResponseEntity<SuccessResponseDTO> extendDueDate(
            @PathVariable String assignmentId,
            @RequestBody ExtendDueDateRequest request
    ) {
        log.warn("Extending due date for assignment ID: {} to {}", assignmentId, request.newDueDate());
        assignmentService.extendDueDate(
                AssignmentId.fromString(assignmentId),
                LocalDateTime.parse(request.newDueDate())
        );
        log.info("Due date for assignment ID {} extended.", assignmentId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Due date extended successfully", null));
    }

    @PutMapping("/{assignmentId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateAssignment(@PathVariable String assignmentId) {
        log.info("Activating assignment ID: {}", assignmentId);
        assignmentService.activateAssignment(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment activated successfully", null));
    }

    @PutMapping("/{assignmentId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateAssignment(@PathVariable String assignmentId) {
        log.warn("Deactivating assignment ID: {}", assignmentId);
        assignmentService.deactivateAssignment(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment deactivated successfully", null));
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT QUERIES
    // ------------------------------------------------------------------



    @GetMapping("/calendar/student/{studentId}/week")
    public ResponseEntity<List<AssignmentDTO>> getStudentWeekCalendar(
            @PathVariable String studentId,
            @RequestParam String weekStart  // Format: "2025-10-27T00:00:00"
    ) {
        log.info("Fetching week calendar for Student ID: {} starting {}", studentId, weekStart);

        LocalDateTime start = LocalDateTime.parse(weekStart);
        LocalDateTime end = start.plusDays(7);  // Monday to Sunday (inclusive)

        List<AssignmentDTO> assignments = assignmentService.getAssignmentsForStudentWeek(
                UserId.fromString(studentId),
                start,
                end
        );

        log.info("Returning {} assignments for student week view", assignments.size());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/calendar/teacher/{teacherId}/week")
    public ResponseEntity<List<AssignmentDTO> > getTeacherWeekCalendar(
            @PathVariable String teacherId,
            @RequestParam String weekStart  // Format: "2025-10-27T00:00:00"
    ) {
        log.info("Fetching week calendar for Teacher ID: {} starting {}", teacherId, weekStart);

        LocalDateTime start = LocalDateTime.parse(weekStart);
        LocalDateTime end = start.plusDays(7);

        List<AssignmentDTO> assignments = assignmentService.getAssignmentsForTeacherWeek(
                UserId.fromString(teacherId),
                start,
                end
        );

        log.info("Returning {} assignments for teacher week view", assignments.size());
        return ResponseEntity.ok(assignments);
    }



    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable String assignmentId) {
        log.debug("Querying details for assignment ID: {}", assignmentId);
        AssignmentDTO assignment = assignmentService.getAssignmentById(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourse(@PathVariable String courseId) {
        log.debug("Fetching all assignments for Course ID: {}", courseId);
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(assignments);
    }

//    @GetMapping("/course/{courseId}/active")
//    public ResponseEntity<List<AssignmentDTO>> getActiveAssignmentsByCourse(@PathVariable String courseId) {
//        log.debug("Fetching active assignments only for Course ID: {}", courseId);
//        List<AssignmentDTO> assignments = assignmentService.getActiveAssignmentsByCourse(CourseId.fromString(courseId));
//        return ResponseEntity.ok(assignments);
//    }
//
//    @GetMapping("/course/{courseId}/due-soon")
//    public ResponseEntity<List<AssignmentDTO>> getAssignmentsDueSoon(
//            @PathVariable String courseId,
//            @RequestParam(defaultValue = "7") int daysAhead
//    ) {
//        log.debug("Fetching assignments for Course ID {} due in {} days.", courseId, daysAhead);
//        List<AssignmentDTO> assignments = assignmentService.getAssignmentsDueSoon(
//                CourseId.fromString(courseId),
//                daysAhead
//        );
//        return ResponseEntity.ok(assignments);
//    }

//    @GetMapping("/{assignmentId}/can-accept-submissions")
//    public ResponseEntity<Boolean> canAcceptSubmissions(@PathVariable String assignmentId) {
//        log.trace("Checking submission acceptance status for Assignment ID: {}", assignmentId);
//        boolean canAccept = assignmentService.canAcceptSubmissions(AssignmentId.fromString(assignmentId));
//        return ResponseEntity.ok(canAccept);
//    }
//
//    @GetMapping("/{assignmentId}/attachment-count")
//    public ResponseEntity<Integer> getAttachmentCount(@PathVariable String assignmentId) {
//        log.trace("Counting attachments for Assignment ID: {}", assignmentId);
//        int count = assignmentService.getAttachmentCount(AssignmentId.fromString(assignmentId));
//        return ResponseEntity.ok(count);
//    }
}

