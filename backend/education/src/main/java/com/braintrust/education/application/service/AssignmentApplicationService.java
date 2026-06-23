package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.helpers.assignment.AssignmentAttachmentHelper;
import com.braintrust.education.application.helpers.assignment.AssignmentLinkHelper;
import com.braintrust.education.application.helpers.assignment.DocumentStorageHelper;
import com.braintrust.education.application.helpers.validation.AssignmentValidator;
import com.braintrust.education.application.mappers.AssignmentDtoMapper;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.AssignmentTargetType;  // Explicit: from model
import com.braintrust.education.domain.model.SubmissionFormat;      // Explicit: from model
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.domain.valueobjects.Document;        // Explicit: from valueobjects
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssignmentApplicationService implements AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentApplicationService.class);

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final SubmissionRepository submissionRepository;

    private final AssignmentValidator validator;
    private final AssignmentDtoMapper dtoMapper;
    private final DocumentStorageHelper documentStorageHelper;
    private final AssignmentAttachmentHelper attachmentHelper;
    private final AssignmentLinkHelper linkHelper;

    public AssignmentApplicationService(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository,
            SubmissionRepository submissionRepository,
            AssignmentValidator validator,
            AssignmentDtoMapper dtoMapper,
            DocumentStorageHelper documentStorageHelper,
            AssignmentAttachmentHelper attachmentHelper,
            AssignmentLinkHelper linkHelper) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.submissionRepository = submissionRepository;
        this.validator = validator;
        this.dtoMapper = dtoMapper;
        this.documentStorageHelper = documentStorageHelper;
        this.attachmentHelper = attachmentHelper;
        this.linkHelper = linkHelper;
        log.info("AssignmentApplicationService initialized with refactored helpers");
    }

    @Override
    public AssignmentId createAssignment(CreateAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("Creating {} assignment '{}' for Course ID: {}",
                command.targetType(), command.title(), courseId.getValue());

        try {
            AssignmentTargetType targetType = validator.validateTargetType(command.targetType());
            SubmissionFormat submissionFormat = validator.validateSubmissionFormat(command.submissionFormat());

            Assignment assignment = Assignment.create(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions(),
                    targetType,
                    submissionFormat
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long duration = System.currentTimeMillis() - startTime;
            log.info("{} assignment {} created in {}ms",
                    targetType, savedAssignment.getId().getValue(), duration);

            return savedAssignment.getId();

        } catch (Exception e) {
            log.error("Failed to create assignment for Course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to create assignment", e);
        }
    }

    @Override
    public AssignmentId createAssignmentFrontend(CreateAssignmentFrontendDTO command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("Creating {} assignment '{}' with frontend-extracted content for Course ID: {}",
                command.targetType(), command.title(), courseId.getValue());

        try {
            courseRepository.findById(courseId)
                    .orElseThrow(() -> {
                        log.warn("Course not found with ID: {}", courseId.getValue());
                        return new CourseNotFoundException("Course not found");
                    });

            AssignmentTargetType targetType = validator.validateTargetType(command.targetType());
            SubmissionFormat submissionFormat = validator.validateSubmissionFormat(command.submissionFormat());

            AssignmentId tempAssignmentId = AssignmentId.generate();
            log.info("Generated temp Assignment ID: {}", tempAssignmentId.getValue());

            List<Document> documents = new ArrayList<>();
            if (command.attachments() != null && !command.attachments().isEmpty()) {
                long storageStart = System.currentTimeMillis();

                List<DocumentMetadata> metadataList = documentStorageHelper.storeFrontendDocumentsWithRateLimit(
                        tempAssignmentId.getValue(),
                        command.attachments()
                );

                long storageDuration = System.currentTimeMillis() - storageStart;
                log.info("{} frontend documents stored in {}ms", metadataList.size(), storageDuration);

                documents = documentStorageHelper.convertToDocuments(metadataList);
            }

            log.info("{} frontend documents and {} links ready for assignment creation",
                    documents.size(),
                    command.links() != null ? command.links().size() : 0);

            Assignment assignment = Assignment.createWithAttachmentsAndLinks(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions(),
                    documents,
                    command.links() != null ? command.links() : new ArrayList<>(),
                    targetType,
                    submissionFormat
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("{} assignment created with {} frontend documents and {} links in {}ms",
                    targetType,
                    documents.size(),
                    command.links() != null ? command.links().size() : 0,
                    totalDuration);

            return savedAssignment.getId();

        } catch (CourseNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to create assignment with frontend-extracted content for Course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to create assignment with frontend-extracted content", e);
        }
    }

    @Override
    public AssignmentId createAssignmentWithAttachments(CreateAssignmentWithAttachmentsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("Creating {} assignment with {} attachments and {} links for Course ID: {}",
                command.targetType(),
                command.attachments() != null ? command.attachments().size() : 0,
                command.links() != null ? command.links().size() : 0,
                courseId.getValue());

        try {
            courseRepository.findById(courseId)
                    .orElseThrow(() -> {
                        log.warn("Course not found with ID: {}", courseId.getValue());
                        return new CourseNotFoundException("Course not found");
                    });

            AssignmentTargetType targetType = validator.validateTargetType(command.targetType());
            SubmissionFormat submissionFormat = validator.validateSubmissionFormat(command.submissionFormat());

            AssignmentId tempAssignmentId = AssignmentId.generate();
            log.info("Generated temp Assignment ID: {}", tempAssignmentId.getValue());

            List<Document> documents = new ArrayList<>();
            if (command.attachments() != null && !command.attachments().isEmpty()) {
                long storageStart = System.currentTimeMillis();
                List<DocumentMetadata> metadataList = documentStorageHelper.storeDocumentsWithRateLimit(
                        tempAssignmentId.getValue(),
                        command.attachments()
                );
                long storageDuration = System.currentTimeMillis() - storageStart;
                log.info("{} documents stored in {}ms", metadataList.size(), storageDuration);

                documents = documentStorageHelper.convertToDocuments(metadataList);
            }

            log.info("{} documents and {} links ready for assignment creation",
                    documents.size(),
                    command.links() != null ? command.links().size() : 0);

            Assignment assignment = Assignment.createWithAttachmentsAndLinks(
                    courseId,
                    UnitId.fromString(command.unitId()),
                    command.title(),
                    command.description(),
                    LocalDateTime.parse(command.dueDate()),
                    command.maxPoints(),
                    command.instructions(),
                    documents,
                    command.links() != null ? command.links() : new ArrayList<>(),
                    targetType,
                    submissionFormat
            );

            Assignment savedAssignment = assignmentRepository.save(assignment);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("{} assignment created with {} attachments and {} links in {}ms",
                    targetType,
                    documents.size(),
                    command.links() != null ? command.links().size() : 0,
                    totalDuration);

            return savedAssignment.getId();

        } catch (CourseNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to create assignment with attachments/links for Course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to create assignment with attachments and links", e);
        }
    }

    @Override
    public AssignmentId createAssignmentForTeam(CreateTeamAssignmentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        long startTime = System.currentTimeMillis();

        log.info("Creating TEAM assignment '{}' for Course {}",
                command.title(), courseId.getValue());

        try {
            courseRepository.findById(courseId)
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
            log.info("TEAM assignment created in {}ms: {}",
                    duration, savedAssignment.getId().getValue());

            return savedAssignment.getId();

        } catch (Exception e) {
            log.error("Failed to create team assignment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create team assignment", e);
        }
    }

    @Override
    public void updateAssignmentDetails(UpdateAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        log.info("Updating details for Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            SubmissionFormat submissionFormat = validator.validateSubmissionFormat(command.submissionFormat());

            assignment.updateDetails(
                    command.title(),
                    command.description(),
                    command.instructions(),
                    submissionFormat
            );

            assignmentRepository.save(assignment);
            log.info("Assignment {} details updated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("Failed to update assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void extendDueDate(AssignmentId assignmentId, LocalDateTime newDueDate) {
        log.info("Extending due date for Assignment ID {} to {}",
                assignmentId.getValue(), newDueDate);

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.extendDueDate(newDueDate);
            assignmentRepository.save(assignment);

            log.info("Due date extended for Assignment {}", assignmentId.getValue());

        } catch (Exception e) {
            log.error("Failed to extend due date for Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void activateAssignment(AssignmentId assignmentId) {
        log.info("Activating Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.activate();
            assignmentRepository.save(assignment);

            log.info("Assignment {} activated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("Failed to activate Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deactivateAssignment(AssignmentId assignmentId) {
        log.warn("Deactivating Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
            assignment.deactivate();
            assignmentRepository.save(assignment);

            log.warn("Assignment {} deactivated", assignmentId.getValue());

        } catch (Exception e) {
            log.error("Failed to deactivate Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deleteAssignment(AssignmentId assignmentId) {
        log.info("Deleting Assignment ID: {}", assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentByIdOrThrow(assignmentId);

            if (!assignment.getSubmissions().isEmpty()) {
                log.error("Cannot delete assignment {}: It has {} submissions",
                        assignmentId.getValue(), assignment.getSubmissions().size());
                throw new IllegalStateException("Cannot delete assignment with existing submissions");
            }

            assignmentRepository.delete(assignment);
            log.info("Assignment {} deleted successfully", assignmentId.getValue());

        } catch (Exception e) {
            log.error("Failed to delete Assignment {}: {}",
                    assignmentId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void addLink(AssignmentId assignmentId, String link) {
        linkHelper.addLink(assignmentId, link);
    }

    @Override
    public void addLinks(AssignmentId assignmentId, List<String> links) {
        linkHelper.addLinks(assignmentId, links);
    }

    @Override
    public void removeLink(AssignmentId assignmentId, String link) {
        linkHelper.removeLink(assignmentId, link);
    }

    @Override
    public void clearLinks(AssignmentId assignmentId) {
        linkHelper.clearLinks(assignmentId);
    }

    @Override
    public void addAttachment(AssignmentId assignmentId, MultipartFile file) {
        attachmentHelper.addAttachment(assignmentId, file);
    }

    @Override
    public void addMultipleAttachments(AssignmentId assignmentId, List<MultipartFile> files) {
        attachmentHelper.addMultipleAttachments(assignmentId, files);
    }

    @Override
    public void addBulkAttachmentsJson(AssignmentId assignmentId, List<FrontendDocumentDTO> attachments) {
        attachmentHelper.addBulkAttachmentsJson(assignmentId, attachments);
    }

    @Override
    public void addSingleAttachmentJson(AssignmentId assignmentId, FrontendDocumentDTO attachment) {
        attachmentHelper.addSingleAttachmentJson(assignmentId, attachment);
    }

    @Override
    public void removeAttachment(AssignmentId assignmentId, String documentName) {
        attachmentHelper.removeAttachment(assignmentId, documentName);
    }

    @Override
    public void addAttachment(AssignmentId assignmentId, Document document) {
        attachmentHelper.addAttachmentByDocument(assignmentId, document);
    }

    @Override
    public void removeAttachment(AssignmentId assignmentId, Document document) {
        attachmentHelper.removeAttachmentByDocument(assignmentId, document);
    }

    @Override
    public void clearAttachments(AssignmentId assignmentId) {
        attachmentHelper.clearAttachments(assignmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentDTO getAssignmentById(AssignmentId assignmentId) {
        log.info("Fetching Assignment DTO by ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        return dtoMapper.toDTO(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId) {
        log.info("Fetching all assignments for Course ID: {}", courseId.getValue());
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return dtoMapper.toDTOList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByUnit(CourseId courseId, UnitId unitId) {
        log.info("Fetching assignments for Course ID: {} and Unit ID: {}",
                courseId.getValue(), unitId.getValue());
        List<Assignment> assignments = assignmentRepository.findByCourseIdAndUnitId(courseId, unitId);
        return dtoMapper.toDTOList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByStudentCourseUnit(UserId studentId, CourseId courseId, UnitId unitId) {
        log.info("Fetching assignments for Student {} in Course {} Unit {}",
                studentId.getValue(), courseId.getValue(), unitId.getValue());
        List<Assignment> assignments = assignmentRepository.findByStudentCourseUnit(studentId, courseId, unitId);
        return dtoMapper.toDTOList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentByCourseAndUnit(CourseId courseId, UnitId unitId) {
        log.info("Fetching assignments for Course {} Unit {}",
                courseId.getValue(), unitId.getValue());
        List<Assignment> assignments = assignmentRepository.findByCourseIdAndUnitId(courseId, unitId);
        return dtoMapper.toDTOList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForStudentWeek(
            UserId studentId,
            LocalDateTime weekStart,
            LocalDateTime weekEnd) {

        log.info("Fetching assignments for Student {} for week {} to {}",
                studentId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByStudentForWeek(
                studentId, weekStart, weekEnd);

        Map<String, String> submissionStatusByAssignmentId = assignments.stream()
                .map(Assignment::getCourseId)
                .distinct()
                .flatMap(courseId -> submissionRepository.findByCourseAndStudent(courseId, studentId).stream())
                .collect(Collectors.toMap(
                        s -> s.getAssignmentId().getValue(),
                        s -> s.getStatus().name(),
                        (existing, replacement) -> replacement
                ));

        log.info("Found {} assignments for student", assignments.size());
        return assignments.stream()
                .map(a -> dtoMapper.toDTOWithStudentStatus(
                        a, submissionStatusByAssignmentId.get(a.getId().getValue())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForTeacherWeek(
            UserId teacherId,
            LocalDateTime weekStart,
            LocalDateTime weekEnd) {

        log.info("Fetching assignments for Teacher {} for week {} to {}",
                teacherId.getValue(), weekStart.toLocalDate(), weekEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByTeacherForWeek(
                teacherId, weekStart, weekEnd);

        log.info("Found {} assignments for teacher", assignments.size());
        return dtoMapper.toDTOList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForStudentMonth(
            UserId studentId,
            LocalDateTime monthStart,
            LocalDateTime monthEnd) {

        log.info("Fetching assignments for Student {} for month {} to {}",
                studentId.getValue(), monthStart.toLocalDate(), monthEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByStudentForMonth(
                studentId, monthStart, monthEnd);

        Map<String, String> submissionStatusByAssignmentId = assignments.stream()
                .map(Assignment::getCourseId)
                .distinct()
                .flatMap(courseId -> submissionRepository.findByCourseAndStudent(courseId, studentId).stream())
                .collect(Collectors.toMap(
                        s -> s.getAssignmentId().getValue(),
                        s -> s.getStatus().name(),
                        (existing, replacement) -> replacement
                ));

        log.info("Found {} assignments for student month view", assignments.size());
        return assignments.stream()
                .map(a -> dtoMapper.toDTOWithStudentStatus(
                        a, submissionStatusByAssignmentId.get(a.getId().getValue())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsForTeacherMonth(
            UserId teacherId,
            LocalDateTime monthStart,
            LocalDateTime monthEnd) {

        log.info("Fetching assignments for Teacher {} for month {} to {}",
                teacherId.getValue(), monthStart.toLocalDate(), monthEnd.toLocalDate());

        List<Assignment> assignments = assignmentRepository.findAssignmentsByTeacherForMonth(
                teacherId, monthStart, monthEnd);

        log.info("Found {} assignments for teacher month view", assignments.size());
        return dtoMapper.toDTOList(assignments);
    }

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("Assignment not found with ID: {}", assignmentId.getValue());
                    return new AssignmentNotFoundException(
                            "Assignment not found: " + assignmentId.getValue());
                });
    }
}