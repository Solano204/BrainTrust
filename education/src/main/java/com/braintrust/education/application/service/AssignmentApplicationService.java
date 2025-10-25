package com.braintrust.education.application.service;

// 📍 education/application/services/AssignmentApplicationService.java

import com.braintrust.education.application.dtos.*;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.dtos.dtos.DocumentDTO;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.exceptions.InvalidDocumentTypeException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentApplicationService implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public AssignmentApplicationService(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    // ✅ ASSIGNMENT COMMANDS

    @Override
    public AssignmentId createAssignment(CreateAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));

        Assignment assignment = Assignment.create(
                courseId,
                command.title(),
                command.description(),
                LocalDateTime.parse(command.dueDate()),
                command.maxPoints(),
                command.instructions()
        );

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return savedAssignment.getId();
    }

    @Override
    public AssignmentId createAssignmentWithAttachments(CreateAssignmentWithAttachmentsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));

        List<Document> documents = command.attachments().stream()
                .map(dto -> {
                    try {
                        DocumentType documentType = DocumentType.fromString(dto.documentType().toUpperCase());
                        return new Document(
                                dto.name(),
                                dto.fileType(),
                                dto.storagePath(),
                                dto.textContent(),
                                documentType
                        );
                    } catch (IllegalArgumentException e) {
                        throw new InvalidDocumentTypeException("Invalid document type: " + dto.documentType());
                    }
                })
                .collect(Collectors.toList());

        Assignment assignment = Assignment.createWithAttachments(
                courseId,
                command.title(),
                command.description(),
                LocalDateTime.parse(command.dueDate()),
                command.maxPoints(),
                command.instructions(),
                documents
        );

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return savedAssignment.getId();
    }

    @Override
    public void updateAssignmentDetails(UpdateAssignmentCommand command) {
        Assignment assignment = findAssignmentByIdOrThrow(AssignmentId.fromString(command.assignmentId()));

        assignment.updateDetails(
                command.title(),
                command.description(),
                command.instructions()
        );

        assignmentRepository.save(assignment);
    }

    @Override
    public void addAttachment(AssignmentId assignmentId, Document document) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.addAttachment(document);
        assignmentRepository.save(assignment);
    }

    @Override
    public void removeAttachment(AssignmentId assignmentId, Document document) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.removeAttachment(document);
        assignmentRepository.save(assignment);
    }

    @Override
    public void clearAttachments(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.clearAttachments();
        assignmentRepository.save(assignment);
    }

    @Override
    public void extendDueDate(AssignmentId assignmentId, LocalDateTime newDueDate) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.extendDueDate(newDueDate);
        assignmentRepository.save(assignment);
    }

    @Override
    public void activateAssignment(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.activate();
        assignmentRepository.save(assignment);
    }

    @Override
    public void deactivateAssignment(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.deactivate();
        assignmentRepository.save(assignment);
    }

    // ✅ ASSIGNMENT QUERIES

    @Override
    @Transactional(readOnly = true)
    public AssignmentDTO getAssignmentById(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return mapToAssignmentDTO(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getActiveAssignmentsByCourse(CourseId courseId) {
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

        List<Assignment> assignments = assignmentRepository.findAssignmentsDueBetween(courseId, now, future);
        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAcceptSubmissions(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.canAcceptSubmissions();
    }

    @Override
    @Transactional(readOnly = true)
    public int getAttachmentCount(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.getAttachmentCount();
    }

    // ✅ PRIVATE HELPER METHODS

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found: " + assignmentId.getValue()));
    }

    private AssignmentDTO mapToAssignmentDTO(Assignment assignment) {
        List<DocumentDTO> attachmentDTOs = assignment.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath(),
                        doc.getCreatedAt().toString(),
                        "PDF",
                        0L // TODO: Get file size
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