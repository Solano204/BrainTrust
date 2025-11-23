package com.braintrust.education.application.service;

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
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.model.AssignmentTargetType;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
@Transactional

// other imports...

public class AssignmentApplicationService implements AssignmentService {

    private static final Logger log =
            LoggerFactory.getLogger(AssignmentApplicationService.class);

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final DocumentStorageService documentStorageService;
    private final Semaphore storageRateLimiter = new Semaphore(60);

    public AssignmentApplicationService(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository,
            DocumentStorageService documentStorageService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.documentStorageService = documentStorageService;
        log.info("✅ AssignmentApplicationService initialized with Virtual Threads support");
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT COMMANDS (Creation and Update)
    // ------------------------------------------------------------------

    @Override
    public AssignmentId createAssignment(CreateAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating {} assignment '{}' for Course ID: {}",
                command.targetType(), command.title(), courseId.getValue());

        try {


            AssignmentTargetType targetType = validateTargetType(command.targetType());

            Assignment assignment = Assignment.create(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions(),
                    targetType
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ {} assignment {} created in {}ms",
                    targetType, savedAssignment.getId().getValue(), duration);

            return savedAssignment.getId();

        } catch (CourseNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to create assignment for Course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to create assignment", e);
        }
    }

    @Override
    public AssignmentId createAssignmentWithAttachments(CreateAssignmentWithAttachmentsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating {} assignment with {} attachments for Course ID: {}",
                command.targetType(), command.attachments().size(), courseId.getValue());

        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> {
                        log.warn("❌ Course not found with ID: {}", courseId.getValue());
                        return new CourseNotFoundException("Course not found");
                    });

            AssignmentTargetType targetType = validateTargetType(command.targetType());

            AssignmentId tempAssignmentId = AssignmentId.generate();
            log.debug("📝 Generated temp Assignment ID: {}", tempAssignmentId.getValue());

            long storageStart = System.currentTimeMillis();
            List<DocumentMetadata> metadataList = storeDocumentsWithRateLimit(
                    tempAssignmentId.getValue(),
                    command.attachments()
            );
            long storageDuration = System.currentTimeMillis() - storageStart;
            log.info("📁 {} documents stored in {}ms", metadataList.size(), storageDuration);

            List<Document> documents = metadataList.stream()
                    .map(metadata -> new Document(
                            metadata.getOriginalFilename(),
                            metadata.getStoragePath()
                    ))
                    .collect(Collectors.toList());

            log.debug("✅ {} documents mapped to domain objects", documents.size());

            Assignment assignment = Assignment.createWithAttachments(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions(),
                    documents,
                    targetType
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("✅ {} assignment with attachments created in {}ms",
                    targetType, totalDuration);

            return savedAssignment.getId();

        } catch (CourseNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to create assignment with attachments for Course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to create assignment with attachments", e);
        }
    }

    @Override
    public AssignmentId createAssignmentForTeam(CreateTeamAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating TEAM assignment '{}' for Course {}",
                command.title(), courseId.getValue());

        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new CourseNotFoundException("Course not found"));

            Assignment assignment = Assignment.createForTeam(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions()
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ TEAM assignment created in {}ms: {}",
                    duration, savedAssignment.getId().getValue());

            return savedAssignment.getId();

        } catch (Exception e) {
            log.error("❌ Failed to create team assignment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create team assignment", e);
        }
    }

    @Override
    public void updateAssignmentDetails(UpdateAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        log.info("🔄 Updating details for Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);

            assignment.updateDetails(
                    command.title(),
                    command.description(),
                    command.instructions()
            );

            assignmentRepository.save(assignment);
            log.info("✅ Assignment {} details updated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to update assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void addAttachment(AssignmentId assignmentId, Document document) {
        log.info("📎 Adding attachment to Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.addAttachment(document);
            assignmentRepository.save(assignment);

            log.info("✅ Attachment added to Assignment {}", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to add attachment to Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void removeAttachment(AssignmentId assignmentId, Document document) {
        log.warn("🗑️ Removing attachment from Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.removeAttachment(document);
            assignmentRepository.save(assignment);

            log.info("✅ Attachment removed from Assignment {}", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to remove attachment from Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void clearAttachments(AssignmentId assignmentId) {
        log.warn("🗑️ Clearing all attachments for Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.clearAttachments();
            assignmentRepository.save(assignment);

            log.info("✅ All attachments cleared for Assignment {}", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to clear attachments for Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void extendDueDate(AssignmentId assignmentId, LocalDateTime newDueDate) {
        log.info("📅 Extending due date for Assignment ID {} to {}",
                assignmentId.getValue(), newDueDate);

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.extendDueDate(newDueDate);
            assignmentRepository.save(assignment);

            log.info("✅ Due date extended for Assignment {}", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to extend due date for Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void activateAssignment(AssignmentId assignmentId) {
        log.info("✅ Activating Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.activate();
            assignmentRepository.save(assignment);

            log.info("✅ Assignment {} activated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to activate Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deactivateAssignment(AssignmentId assignmentId) {
        log.warn("⚠️ Deactivating Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.deactivate();
            assignmentRepository.save(assignment);

            log.warn("⚠️ Assignment {} deactivated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to deactivate Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deleteAssignment(AssignmentId assignmentId) {
        log.info("🗑️ Deleting Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);

            // Check if assignment has submissions
            if (!assignment.getSubmissions().isEmpty()) {
                log.error("❌ Cannot delete assignment {}: It has {} submissions",
                        assignmentId.getValue(), assignment.getSubmissions().size());
                throw new IllegalStateException("Cannot delete assignment with existing submissions");
            }

            assignmentRepository.delete(assignment);
            log.info("✅ Assignment {} deleted successfully", assignmentId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to delete Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    // ------------------------------------------------------------------
    // ✅ ASSIGNMENT QUERIES
    // ------------------------------------------------------------------

    /*
    @Override
    @Transactional(readOnly = true)
    public AssignmentDTO getAssignmentById(AssignmentId assignmentId) {
        log.debug("📊 Fetching Assignment DTO by ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return mapToAssignmentDTO(assignment);
    }
    */

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId) {
        log.debug("📊 Fetching all assignments for Course ID: {}", courseId.getValue());

        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByUnit(CourseId courseId, UnitId unitId) {
        log.debug("📊 Fetching assignments for Course ID: {} and Unit ID: {}",
                courseId.getValue(), unitId.getValue());

        List<Assignment> assignments = assignmentRepository.findByCourseIdAndUnitId(courseId, unitId);

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getActiveAssignmentsByCourse(CourseId courseId) {
        log.debug("📊 Fetching active assignments for Course ID: {}", courseId.getValue());

        List<Assignment> assignments = assignmentRepository.findActiveAssignmentsByCourse(courseId);

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsDueSoon(CourseId courseId, int daysAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusDays(daysAhead);

        log.debug("📊 Fetching assignments for Course {} due between {} and {}",
                courseId.getValue(), now.toLocalDate(), future.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsDueBetween(
                courseId, now, future);

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }
    */

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForStudentWeek(
            UserId studentId,
            LocalDateTime weekStart,
            LocalDateTime weekEnd) {

        log.info("📅 Fetching assignments for Student {} for week {} to {}",
                studentId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByStudentForWeek(
                studentId, weekStart, weekEnd);

        log.info("✅ Found {} assignments for student", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForTeacherWeek(
            UserId teacherId,
            LocalDateTime weekStart,
            LocalDateTime weekEnd) {

        log.info("📅 Fetching assignments for Teacher {} for week {} to {}",
                teacherId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByTeacherForWeek(
                teacherId, weekStart, weekEnd);

        log.info("✅ Found {} assignments for teacher", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForStudentMonth(
            UserId studentId,
            LocalDateTime monthStart,
            LocalDateTime monthEnd) {

        log.info("📅 Fetching assignments for Student {} for month {} to {}",
                studentId.getValue(), monthStart.toLocalDate(), monthEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByStudentForMonth(
                studentId, monthStart, monthEnd);

        log.info("✅ Found {} assignments for student month view", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForTeacherMonth(
            UserId teacherId,
            LocalDateTime monthStart,
            LocalDateTime monthEnd) {

        log.info("📅 Fetching assignments for Teacher {} for month {} to {}",
                teacherId.getValue(), monthStart.toLocalDate(), monthEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByTeacherForMonth(
                teacherId, monthStart, monthEnd);

        log.info("✅ Found {} assignments for teacher month view", assignments.size());

        return assignments.stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public boolean canAcceptSubmissions(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.canAcceptSubmissions();
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public int getAttachmentCount(AssignmentId assignmentId) {
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return assignment.getAttachmentCount();
    }
    */

    // ------------------------------------------------------------------
    // ✅ PRIVATE HELPER METHODS
    // ------------------------------------------------------------------

    private List<DocumentMetadata> storeDocumentsWithRateLimit(
            String targetId,
            List<org.springframework.web.multipart.MultipartFile> files) {

        try {
            storageRateLimiter.acquire();
            try {
                return documentStorageService.storeDocument(targetId, files);
            } finally {
                storageRateLimiter.release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Document storage interrupted", e);
        }
    }

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("❌ Assignment not found with ID: {}", assignmentId.getValue());
                    return new AssignmentNotFoundException(
                            "Assignment not found: " + assignmentId.getValue());
                });
    }

    private AssignmentTargetType validateTargetType(String targetType) {
        if (targetType == null || targetType.trim().isEmpty()) {
            return AssignmentTargetType.INDIVIDUAL;
        }

        try {
            return AssignmentTargetType.valueOf(targetType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid target type. Must be INDIVIDUAL or TEAM");
        }
    }

    private AssignmentDTO mapToAssignmentDTO(Assignment assignment) {
        List<DocumentDTO> attachmentDTOs = assignment.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());

        String targetType = assignment.getTargetType().name();
        boolean isTeamAssignment = assignment.isTeamAssignment();

        return new AssignmentDTO(
                assignment.getId().getValue(),
                assignment.getCourseId().getValue(),
                assignment.getUnitId().getValue(),
                "Course Name",
                "Unit Name",
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
                targetType,
                isTeamAssignment,
                attachmentDTOs);
    }
}