package com.braintrust.education.application.service;

// 📍 education/application/services/AssignmentApplicationService.java

import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.dtos.dtos.DocumentDTO;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.exceptions.InvalidDocumentTypeException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j // ⬅️ Enable the 'log' variable
public class AssignmentApplicationService implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final DocumentStorageService documentStorageService;


    public AssignmentApplicationService(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository, DocumentStorageService documentStorageService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.documentStorageService = documentStorageService;
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT COMMANDS (Creation and Update)
    // ------------------------------------------------------------------

    @Override
    public AssignmentId createAssignment(CreateAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Attempting to create new assignment '{}' for Course ID: {}", command.title(), courseId.getValue());

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found with ID: {}", courseId.getValue());
                    return new CourseNotFoundException("Course not found");
                });

        Assignment assignment = Assignment.create(
                courseId,
                command.title(),
                command.description(),
                LocalDateTime.parse(command.dueDate()),
                command.maxPoints(),
                command.instructions()
        );

        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment created and saved. ID: {}", savedAssignment.getId().getValue());
        return savedAssignment.getId();
    }

    @Override
    public AssignmentId createAssignmentWithAttachments(CreateAssignmentWithAttachmentsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Attempting to create assignment with {} attachments for Course ID: {}",
                command.attachments().size(), courseId.getValue());

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found with ID: {}", courseId.getValue());
                    return new CourseNotFoundException("Course not found");
                });

        // Generate a temporary ID for storage (before assignment is created)
        AssignmentId tempAssignmentId = AssignmentId.generate();

        // 1. STORE DOCUMENTS and GET METADATA LIST
        log.debug("Storing {} attachment files for assignment.", command.attachments().size());
        List<DocumentMetadata> metadataList = documentStorageService.storeDocument(
                tempAssignmentId.getValue(), // Use temporary assignment ID as container
                command.attachments()
        );
        log.info("✅ {} documents stored successfully.", metadataList.size());

        // 2. CONVERT METADATA LIST TO DOMAIN DOCUMENT LIST
        List<Document> documents = metadataList.stream()
                .map(metadata -> new Document(
                        metadata.getOriginalFilename(),
                        metadata.getStoragePath()
                ))
                .collect(Collectors.toList());

        log.debug("✅ {} documents mapped to domain objects.", documents.size());

        // 3. CREATE ASSIGNMENT WITH DOCUMENTS
        Assignment assignment = Assignment.createWithAttachments(
                courseId,
                command.title(),
                command.description(),
                LocalDateTime.parse(command.dueDate()),
                command.maxPoints(),
                command.instructions(),
                documents
        );

        // Override the generated ID with the one used for storage
        // OR update storage paths if needed (depends on your implementation)

        // 4. SAVE ASSIGNMENT
        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("✅ Assignment with attachments created. ID: {}", savedAssignment.getId().getValue());

        return savedAssignment.getId();
    }
    @Override
    public void updateAssignmentDetails(UpdateAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        log.info("Updating details for Assignment ID: {}", assignmentId.getValue());

        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);

        assignment.updateDetails(
                command.title(),
                command.description(),
                command.instructions()
        );

        assignmentRepository.save(assignment);
        log.debug("Assignment ID {} details updated and saved.", assignmentId.getValue());
    }


    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForStudentWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Fetching all assignments for Student ID {} for week {} to {}",
                studentId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByStudentForWeek(
                studentId,
                weekStart,
                weekEnd
        );

        log.info("Found {} assignments for student", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForTeacherWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd) {
        log.info("Fetching all assignments for Teacher ID {} for week {} to {}",
                teacherId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByTeacherForWeek(
                teacherId,
                weekStart,
                weekEnd
        );

        log.info("Found {} assignments for teacher", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void addAttachment(AssignmentId assignmentId, Document document) {
        log.info("Adding attachment to Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.addAttachment(document);
        assignmentRepository.save(assignment);
        log.debug("Attachment added to Assignment ID {}.", assignmentId.getValue());
    }

    @Override
    public void removeAttachment(AssignmentId assignmentId, Document document) {
        log.warn("Removing attachment from Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.removeAttachment(document);
        assignmentRepository.save(assignment);
        log.debug("Attachment removed from Assignment ID {}.", assignmentId.getValue());
    }

    @Override
    public void clearAttachments(AssignmentId assignmentId) {
        log.warn("Clearing all attachments for Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.clearAttachments();
        assignmentRepository.save(assignment);
        log.info("All attachments cleared for Assignment ID {}.", assignmentId.getValue());
    }

    @Override
    public void extendDueDate(AssignmentId assignmentId, LocalDateTime newDueDate) {
        log.warn("Extending due date for Assignment ID {} to {}", assignmentId.getValue(), newDueDate);
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.extendDueDate(newDueDate);
        assignmentRepository.save(assignment);
        log.info("Due date successfully extended for Assignment ID {}.", assignmentId.getValue());
    }

    @Override
    public void activateAssignment(AssignmentId assignmentId) {
        log.info("Activating Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.activate();
        assignmentRepository.save(assignment);
        log.info("Assignment ID {} is now active.", assignmentId.getValue());
    }

    @Override
    public void deactivateAssignment(AssignmentId assignmentId) {
        log.warn("Deactivating Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.deactivate();
        assignmentRepository.save(assignment);
        log.warn("Assignment ID {} is now inactive.", assignmentId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public AssignmentDTO getAssignmentById(AssignmentId assignmentId) {
        log.debug("Querying Assignment DTO by ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return mapToAssignmentDTO(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId) {
        log.debug("Fetching all assignments for Course ID: {}", courseId.getValue());
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getActiveAssignmentsByCourse(CourseId courseId) {
        log.debug("Fetching active assignments for Course ID: {}", courseId.getValue());
        List<Assignment> assignments = assignmentRepository.findActiveAssignmentsByCourse(courseId);
        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsDueSoon(CourseId courseId, int daysAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusDays(daysAhead);

        log.debug("Querying assignments for Course ID {} due between {} and {}",
                courseId.getValue(), now.toLocalDate(), future.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsDueBetween(courseId, now, future);
        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAcceptSubmissions(AssignmentId assignmentId) {
        log.trace("Checking submission acceptance status for Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.canAcceptSubmissions();
    }

    @Override
    @Transactional(readOnly = true)
    public int getAttachmentCount(AssignmentId assignmentId) {
        log.trace("Counting attachments for Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.getAttachmentCount();
    }

    // ------------------------------------------------------------------
    // ✅ PRIVATE HELPER METHODS
    // ------------------------------------------------------------------

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        log.trace("Attempting to retrieve Assignment ID: {}", assignmentId.getValue());
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("Assignment not found with ID: {}", assignmentId.getValue());
                    return new AssignmentNotFoundException("Assignment not found: " + assignmentId.getValue());
                });
    }

    private AssignmentDTO mapToAssignmentDTO(Assignment assignment) {
        // MAPPING LOGIC (no logging required here, as it's a pure transformation)
        List<DocumentDTO> attachmentDTOs = assignment.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());

        return new AssignmentDTO(
                assignment.getId().getValue(),
                assignment.getCourseId().getValue(),
                "Course Name", // TODO: Get from Course
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getCreatedAt().toString(),
                assignment.getDueDate() != null ? assignment.getDueDate().toString() : null,
                assignment.getMaxScore().getValue(),
                assignment.getInstructions(),
                assignment.isActive(),
                assignment.getSubmissions().size(),
                assignment.getAttachmentCount(),
                assignment.canAcceptSubmissions(),
                attachmentDTOs
        );
    }
}