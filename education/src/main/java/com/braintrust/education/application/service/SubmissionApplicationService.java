package com.braintrust.education.application.service;

// 📍 education/application/services/SubmissionApplicationService.java

import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j // ⬅️ Enable the 'log' variable
public class SubmissionApplicationService implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final DocumentStorageService documentStorageService;
    private final AnalysisApplicationService analysisApplicationService;
    @Value("${ai.model-default-type:ENSEMBLE}")
    private String MODEL_IA;

    public SubmissionApplicationService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository, DocumentStorageService documentStorageService, AnalysisApplicationService analysisApplicationService

    ) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.documentStorageService = documentStorageService;
        this.analysisApplicationService = analysisApplicationService;
    }


    @Override
    public SubmissionId submitAssignment(SubmitAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());
        log.info("Student ID {} attempting to submit work for Assignment ID: {}",
                studentId.getValue(), assignmentId.getValue());

        // Verify assignment exists
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("Submission failed: Assignment not found with ID {}", assignmentId.getValue());
                    return new AssignmentNotFoundException("Assignment not found");
                });

        // Check if assignment can accept submissions
        if (!assignment.canAcceptSubmissions()) {
            log.warn("Submission rejected for Assignment ID {} - inactive and past due date.",
                    assignmentId.getValue());
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }



        // 1. STORE DOCUMENTS and GET METADATA LIST (Required Logic)
        // We pass the newly generated submissionId as the target container ID.
        List<DocumentMetadata> metadataList = documentStorageService.storeDocument(
                assignmentId.getValue(),
                command.attachments() // ⬅️ Assuming this field now contains List<MultipartFile>
        );

        // 2. CONVERT METADATA LIST TO DOMAIN DOCUMENT LIST
        List<Document> documents = metadataList.stream()
                // Map the storage result (metadata) directly to the domain value object (Document)
                .map(metadata -> new Document(
                        metadata.getOriginalFilename(), // Use the original filename as the Document name
                        metadata.getStoragePath()      // Use the returned unique storage path
                ))
                .collect(Collectors.toList());

        log.info("✅ {} documents mapped and ready for domain submission.", documents.size());

        Submission submission = assignment.submitWork(studentId, command.content(), documents);

        assignmentRepository.save(assignment);
        Submission savedSubmission = submissionRepository.save(submission);

        analysisApplicationService.analyzePdfSubmission(new AnalyzePdfSubmissionCommand(savedSubmission.getId().getValue(),
                command.attachments(), MODEL_IA));

        log.info("Submission ID {} created for Student ID {} (Assignment {}).",
                savedSubmission.getId().getValue(), studentId.getValue(), assignmentId.getValue());

        return savedSubmission.getId();
    }

    @Override
    public void gradeSubmission(GradeSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        log.info("Grading Submission ID: {} with score: {}", submissionId.getValue(), command.gradeValue());

        Submission submission = findSubmissionByIdOrThrow(submissionId);

        Grade grade = new Grade(
                new BigDecimal(command.gradeValue()),
                new BigDecimal(command.maxScore())
        );

        submission.grade(grade, command.feedback());
        submissionRepository.save(submission);
        log.info("Submission ID {} successfully graded.", submissionId.getValue());
    }

    @Override
    public void returnSubmissionForRevision(ReturnSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());
        log.warn("Returning Submission ID {} for revision. Feedback length: {}", submissionId.getValue(), command.feedback().length());

        Submission submission = findSubmissionByIdOrThrow(submissionId);
        submission.returnForRevision(command.feedback());
        submissionRepository.save(submission);
        log.info("Submission ID {} returned.", submissionId.getValue());
    }

    @Override
    public void requestAIAnalysis(SubmissionId submissionId) {
        log.info("Marking Submission ID {} for AI Analysis.", submissionId.getValue());

        Submission submission = findSubmissionByIdOrThrow(submissionId);
        submission.markForAIAnalysis();
        submissionRepository.save(submission);

        // TODO: Publish event or call AI Detection Context
        log.debug("Event published/call made for AI analysis of Submission ID {}.", submissionId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ SUBMISSION QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(SubmissionId submissionId) {
        log.debug("Fetching DTO for Submission ID: {}", submissionId.getValue());
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        return mapToSubmissionDTO(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByAssignment(AssignmentId assignmentId) {
        log.debug("Fetching all submissions for Assignment ID: {}", assignmentId.getValue());
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        log.debug("Fetching all submissions by Student ID: {}", studentId.getValue());
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SubmissionDTO> getLatestSubmission(AssignmentId assignmentId, UserId studentId) {
        log.debug("Fetching latest submission for Assignment {} by Student {}", assignmentId.getValue(), studentId.getValue());
        return submissionRepository.findLatestByAssignmentAndStudent(assignmentId, studentId)
                .map(this::mapToSubmissionDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStatus(SubmissionStatus status) {
        log.debug("Fetching submissions with status: {}", status.name());
        List<Submission> submissions = submissionRepository.findByStatus(status);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getLateSubmissions(AssignmentId assignmentId) {
        log.debug("Calculating and fetching late submissions for Assignment ID: {}", assignmentId.getValue());

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        if (assignment.getDueDate() == null) {
            log.warn("Cannot determine late submissions for Assignment ID {} (no due date).", assignmentId.getValue());
            return List.of();
        }

        List<Submission> submissions = submissionRepository.findLateSubmissions(
                assignmentId,
                assignment.getDueDate()
        );

        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionAnalyticsDTO getSubmissionAnalytics(AssignmentId assignmentId) {
        log.debug("Calculating analytics for Assignment ID: {}", assignmentId.getValue());

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        int total = submissions.size();
        int graded = (int) submissions.stream().filter(Submission::isGraded).count();
        int pending = (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED).count();
        int returned = (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.RETURNED).count();

        // Safe division for average grade
        BigDecimal avgGrade = submissions.stream()
                .filter(Submission::isGraded)
                .map(s -> s.getGrade().getValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        avgGrade = avgGrade.divide(BigDecimal.valueOf(graded > 0 ? graded : 1), 2, BigDecimal.ROUND_HALF_UP);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        int late = assignment.getDueDate() != null
                ? (int) submissions.stream().filter(s -> s.isLate(assignment.getDueDate())).count()
                : 0;

        int onTime = total - late;

        StatusDistributionDTO statusDist = new StatusDistributionDTO(
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.DRAFT).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.GRADED).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.RETURNED).count()
        );

        log.info("Analytics for Assignment {}: Total={}, Graded={}, AvgGrade={}", assignmentId.getValue(), total, graded, avgGrade);

        return new SubmissionAnalyticsDTO(
                assignmentId.getValue(),
                total,
                graded,
                pending,
                returned,
                avgGrade.toString(),
                late,
                onTime,
                statusDist
        );
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasStudentSubmitted(AssignmentId assignmentId, UserId studentId) {
        log.trace("Checking submission existence for Assignment {} by Student {}", assignmentId.getValue(), studentId.getValue());
        List<Submission> submissions = submissionRepository.findByAssignmentAndStudent(assignmentId, studentId);
        return !submissions.isEmpty();
    }

    // ------------------------------------------------------------------
    // ✅ PRIVATE HELPER METHODS
    // ------------------------------------------------------------------

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        log.trace("Attempting to retrieve Submission ID: {}", submissionId.getValue());
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> {
                    log.warn("Submission not found with ID: {}", submissionId.getValue());
                    return new SubmissionNotFoundException("Submission not found: " + submissionId.getValue());
                });
    }

    private SubmissionDTO mapToSubmissionDTO(Submission submission) {
        // MAPPING LOGIC (no logging required here, as it's a pure transformation)
        GradeDTO gradeDTO = submission.getGrade() != null
                ? new GradeDTO(
                submission.getGrade().getValue().toString(),
                submission.getGrade().getMaxScore().toString(),
                submission.getGrade().getPercentage().toString()
        )
                : null;

        List<DocumentDTO> attachmentDTOs = submission.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());

        // Get assignment to check if late
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElse(null);

        boolean isLate = assignment != null && assignment.getDueDate() != null
                ? submission.isLate(assignment.getDueDate())
                : false;

        return new SubmissionDTO(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                "HI ", // TODO: Get from Assignment
                submission.getStudentId().getValue(),
                "Student", // TODO: Get from UserQueryPort
                submission.getContent(),
                submission.getStatus().name(),
                gradeDTO,
                submission.getTeacherFeedback(),
                submission.getSubmittedAt().toString(),
                isLate,
                attachmentDTOs,
                null // TODO: Get AI analysis if available
        );
    }
}