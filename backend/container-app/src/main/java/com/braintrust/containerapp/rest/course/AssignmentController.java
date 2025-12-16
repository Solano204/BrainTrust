package com.braintrust.containerapp.rest.course;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private static final Logger log = LoggerFactory.getLogger(AssignmentController.class);

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT COMMANDS (CUD Operations)
    // ------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@RequestBody CreateAssignmentCommand command) {
        log.info("Request to create new assignment for Course ID: {}", command.courseId());
        AssignmentId assignmentId = assignmentService.createAssignment(command);
        AssignmentDTO createdAssignment = assignmentService.getAssignmentById(assignmentId);
        log.info("Assignment created successfully with ID: {}", assignmentId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
    }

    @PostMapping(value = "/with-attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssignmentDTO> createAssignmentWithAttachments(
            @ModelAttribute CreateAssignmentWithAttachmentsCommand command
    ) {
        log.info("Request to create assignment with {} attachments for Course ID: {}",
                command.attachments().size(), command.courseId());

        AssignmentId assignmentId = assignmentService.createAssignmentWithAttachments(command);
        AssignmentDTO createdAssignment = assignmentService.getAssignmentById(assignmentId);

        log.info("Assignment created with attachments. ID: {}", assignmentId.getValue());

        return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
    }



    @PostMapping(value = "/frontend", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AssignmentDTO> createAssignmentFrontend(
            @RequestBody CreateAssignmentFrontendDTO command
    ) {
        log.info("Frontend extraction - Creating assignment '{}' for Course {} with {} frontend documents",
                command.title(), command.courseId(),
                command.attachments() != null ? command.attachments().size() : 0);

        AssignmentId assignmentId = assignmentService.createAssignmentFrontend(command);
        AssignmentDTO createdAssignment = assignmentService.getAssignmentById(assignmentId);

        log.info("Assignment created with frontend extraction. ID: {}", assignmentId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
    }



    // ✅ Bulk attachments via JSON (FrontendDocumentDTO) for existing assignments
    @PostMapping(value = "/{assignmentId}/attachments/bulk-json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SuccessResponseDTO> addBulkAttachmentsJson(
            @PathVariable String assignmentId,
            @Valid @RequestBody AddBulkAttachmentsJsonCommand command
    ) {
        log.info("Request to add {} attachments via JSON to Assignment ID: {}",
                command.attachments() != null ? command.attachments().size() : 0, assignmentId);

        assignmentService.addBulkAttachmentsJson(
                AssignmentId.fromString(assignmentId),
                command.attachments()
        );

        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachments added successfully via JSON", null)
        );
    }

    // ✅ Single attachment via JSON
    @PostMapping(value = "/{assignmentId}/attachments/single-json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SuccessResponseDTO> addSingleAttachmentJson(
            @PathVariable String assignmentId,
            @Valid @RequestBody FrontendDocumentDTO attachment
    ) {
        log.info("Request to add single attachment via JSON to Assignment ID: {}", assignmentId);

        assignmentService.addSingleAttachmentJson(
                AssignmentId.fromString(assignmentId),
                attachment
        );

        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment added successfully via JSON", null)
        );
    }


    @PutMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> updateAssignment(
            @PathVariable String assignmentId,
            @RequestBody UpdateAssignmentCommand command
    ) {
        log.info("Request to update assignment details for ID: {}", assignmentId);

        if (!assignmentId.equals(command.assignmentId())) {
            throw new IllegalArgumentException("Assignment ID mismatch");
        }

        assignmentService.updateAssignmentDetails(command);
        AssignmentDTO updatedAssignment = assignmentService.getAssignmentById(
                AssignmentId.fromString(assignmentId)
        );

        log.debug("Assignment ID {} details updated.", assignmentId);
        return ResponseEntity.ok(updatedAssignment);
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

    // NEW: Delete assignment only when there are no submissions
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<SuccessResponseDTO> deleteAssignment(@PathVariable String assignmentId) {
        log.info("Request to delete assignment ID: {}", assignmentId);
        assignmentService.deleteAssignment(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Assignment deleted successfully", null));
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT QUERIES
    // ------------------------------------------------------------------

    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable String assignmentId) {
        log.debug("Querying details for assignment ID: {}", assignmentId);
        AssignmentDTO assignment = assignmentService.getAssignmentById(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(assignment);
    }

//    // 3. Get assignments by student and course (CRITICAL - student-submission-api needs this)
//    @GetMapping("/student/{studentId}/course/{courseId}/unit/{unitId}")
//    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByStudentCourseUnit(
//            @PathVariable String studentId,
//            @PathVariable String courseId,
//            @PathVariable String unitId) {
//        log.debug("Fetching assignments for student {} course {} unit {}", studentId, courseId, unitId);
//        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByStudentCourseUnit(
//                UserId.fromString(studentId),
//                CourseId.fromString(courseId),
//                UnitId.fromString(unitId)
//        );
//        return ResponseEntity.ok(assignments);z
//    }

    // 4. Get assignments by course and unit (teacher view - course-tasks-api needs this)
    @GetMapping("/course/{courseId}/unit/{unitId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourseUnit(
            @PathVariable String courseId,
            @PathVariable String unitId) {
        log.debug("Fetching assignments for course {} unit {}", courseId, unitId);
        List<AssignmentDTO> assignments = assignmentService.getAssignmentByCourseAndUnit(
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );
        return ResponseEntity.ok(assignments);
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourse(@PathVariable String courseId) {
        log.debug("Fetching all assignments for Course ID: {}", courseId);
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(assignments);
    }

    // NEW: Get assignments for specific unit in a course
    @GetMapping("/course/unit/{unitId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByUnit(
            @PathVariable String courseId,
            @PathVariable String unitId) {
        log.debug("Fetching assignments for Course ID: {} and Unit ID: {}", courseId, unitId);
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsByUnit(
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );
        return ResponseEntity.ok(assignments);
    }

    /*
    @GetMapping("/course/{courseId}/active")
    public ResponseEntity<List<AssignmentDTO>> getActiveAssignmentsByCourse(@PathVariable String courseId) {
        log.debug("Fetching active assignments only for Course ID: {}", courseId);
        List<AssignmentDTO> assignments = assignmentService.getActiveAssignmentsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(assignments);
    }
    */

    /*
    @GetMapping("/course/{courseId}/due-soon")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsDueSoon(
            @PathVariable String courseId,
            @RequestParam(defaultValue = "7") int daysAhead
    ) {
        log.debug("Fetching assignments for Course ID {} due in {} days.", courseId, daysAhead);
        List<AssignmentDTO> assignments = assignmentService.getAssignmentsDueSoon(
                CourseId.fromString(courseId),
                daysAhead
        );
        return ResponseEntity.ok(assignments);
    }
    */

    /*
    @GetMapping("/{assignmentId}/can-accept-submissions")
    public ResponseEntity<Boolean> canAcceptSubmissions(@PathVariable String assignmentId) {
        log.trace("Checking submission acceptance status for Assignment ID: {}", assignmentId);
        boolean canAccept = assignmentService.canAcceptSubmissions(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(canAccept);
    }
    */

    /*
    @GetMapping("/{assignmentId}/attachment-count")
    public ResponseEntity<Integer> getAttachmentCount(@PathVariable String assignmentId) {
        log.trace("Counting attachments for Assignment ID: {}", assignmentId);
        int count = assignmentService.getAttachmentCount(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(count);
    }
    */

    @GetMapping("/calendar/student/{studentId}/week")
    public ResponseEntity<List<AssignmentDTO>> getStudentWeekCalendar(
            @PathVariable String studentId,
            @RequestParam String weekStart
    ) {
        log.info("Fetching week calendar for Student ID: {} starting {}", studentId, weekStart);

        LocalDateTime start = LocalDateTime.parse(weekStart);
        LocalDateTime end = start.plusDays(7);

        List<AssignmentDTO> assignments = assignmentService.getAssignmentsForStudentWeek(
                UserId.fromString(studentId),
                start,
                end
        );

        log.info("Returning {} assignments for student week view", assignments.size());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/calendar/teacher/{teacherId}/week")
    public ResponseEntity<List<AssignmentDTO>> getTeacherWeekCalendar(
            @PathVariable String teacherId,
            @RequestParam String weekStart
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

    // NEW: Month calendar endpoints for student and teacher
    @GetMapping("/calendar/student/{studentId}/month")
    public ResponseEntity<List<AssignmentDTO>> getStudentMonthCalendar(
            @PathVariable String studentId,
            @RequestParam String monthStart
    ) {
        log.info("Fetching month calendar for Student ID: {} starting {}", studentId, monthStart);

        LocalDateTime start = LocalDateTime.parse(monthStart);
        LocalDateTime end = start.plusMonths(1);

        List<AssignmentDTO> assignments = assignmentService.getAssignmentsForStudentMonth(
                UserId.fromString(studentId),
                start,
                end
        );

        log.info("Returning {} assignments for student month view", assignments.size());
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/calendar/teacher/{teacherId}/month")
    public ResponseEntity<List<AssignmentDTO>> getTeacherMonthCalendar(
            @PathVariable String teacherId,
            @RequestParam String monthStart
    ) {
        log.info("Fetching month calendar for Teacher ID: {} starting {}", teacherId, monthStart);

        LocalDateTime start = LocalDateTime.parse(monthStart);
        LocalDateTime end = start.plusMonths(1);

        List<AssignmentDTO> assignments = assignmentService.getAssignmentsForTeacherMonth(
                UserId.fromString(teacherId),
                start,
                end
        );

        log.info("Returning {} assignments for teacher month view", assignments.size());
        return ResponseEntity.ok(assignments);
    }



    @PostMapping("/{assignmentId}/links")
    public ResponseEntity<SuccessResponseDTO> addLink(
            @PathVariable String assignmentId,
            @Valid @RequestBody AddLinksCommand command
    ) {
        log.info("Request to add link to Assignment ID: {}", assignmentId);
        assignmentService.addLink(
                AssignmentId.fromString(assignmentId),
                command.link()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Link added successfully", null)
        );
    }

    @PostMapping("/{assignmentId}/links/batch")
    public ResponseEntity<SuccessResponseDTO> addMultipleLinks(
            @PathVariable String assignmentId,
            @Valid @RequestBody AddMultipleLinksCommand command
    ) {
        log.info("Request to add {} links to Assignment ID: {}",
                command.links().size(), assignmentId);
        assignmentService.addLinks(
                AssignmentId.fromString(assignmentId),
                command.links()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Links added successfully", null)
        );
    }

    @DeleteMapping("/{assignmentId}/links")
    public ResponseEntity<SuccessResponseDTO> removeLink(
            @PathVariable String assignmentId,
            @Valid @RequestBody RemoveLinkCommand command
    ) {
        log.info("Request to remove link from Assignment ID: {}", assignmentId);
        assignmentService.removeLink(
                AssignmentId.fromString(assignmentId),
                command.linkUrl()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Link removed successfully", null)
        );
    }

    @DeleteMapping("/{assignmentId}/links/all")
    public ResponseEntity<SuccessResponseDTO> clearLinks(@PathVariable String assignmentId) {
        log.info("Request to clear all links from Assignment ID: {}", assignmentId);
        assignmentService.clearLinks(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "All links cleared successfully", null)
        );
    }

    // ------------------------------------------------------------------
    // ✅ ATTACHMENT MANAGEMENT ENDPOINTS
    // ------------------------------------------------------------------

    @PostMapping(value = "/{assignmentId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> addAttachment(
            @PathVariable String assignmentId,
            @Valid @ModelAttribute AddAttachmentCommand command
    ) {
        log.info("Request to add attachment to Assignment ID: {}", assignmentId);
        assignmentService.addAttachment(
                AssignmentId.fromString(assignmentId),
                command.file()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment added successfully", null)
        );
    }

    @PostMapping(value = "/{assignmentId}/attachments/batch",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> addMultipleAttachments(
            @PathVariable String assignmentId,
            @Valid @ModelAttribute AddMultipleAttachmentsCommand command
    ) {
        log.info("Request to add {} attachments to Assignment ID: {}",
                command.files().size(), assignmentId);
        assignmentService.addMultipleAttachments(
                AssignmentId.fromString(assignmentId),
                command.files()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachments added successfully", null)
        );
    }

    @DeleteMapping("/{assignmentId}/attachments")
    public ResponseEntity<SuccessResponseDTO> removeAttachment(
            @PathVariable String assignmentId,
            @Valid @RequestBody RemoveAttachmentCommand command
    ) {
        log.info("Request to remove attachment from Assignment ID: {}", assignmentId);
        assignmentService.removeAttachment(
                AssignmentId.fromString(assignmentId),
                command.documentName()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment removed successfully", null)
        );
    }

    @DeleteMapping("/{assignmentId}/attachments/all")
    public ResponseEntity<SuccessResponseDTO> clearAttachments(@PathVariable String assignmentId) {
        log.info("Request to clear all attachments from Assignment ID: {}", assignmentId);
        assignmentService.clearAttachments(AssignmentId.fromString(assignmentId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "All attachments cleared successfully", null)
        );
    }
}