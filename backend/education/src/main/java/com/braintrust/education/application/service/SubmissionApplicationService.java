package com.braintrust.education.application.service;

// 📍 education/application/services/SubmissionApplicationService.java

import com.braintrust.education.application.dtos.*;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionApplicationService implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;

    public SubmissionApplicationService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository
    ) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // ✅ SUBMISSION COMMANDS

    @Override
    public SubmissionId submitAssignment(SubmitAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());

        // Verify assignment exists and can accept submissions
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        if (!assignment.canAcceptSubmissions()) {
            throw new IllegalStateException("Assignment cannot accept submissions");
        }

        // Convert attachment DTOs to Documents
        List<Document> documents = command.attachments().stream()
                .map(dto -> new Document(
                        dto.name(),
                        dto.fileType()
                ))
                .collect(Collectors.toList());

        // Create submission through assignment aggregate
        Submission submission = assignment.submitWork(studentId, command.content(), documents);

        // Save both assignment and submission
        assignmentRepository.save(assignment); // UPDATE
        Submission savedSubmission = submissionRepository.save(submission); // CREATE

        return savedSubmission.getId();
    }

    @Override
    public void gradeSubmission(GradeSubmissionCommand command) {
        Submission submission = findSubmissionByIdOrThrow(SubmissionId.fromString(command.submissionId()));

        Grade grade = new Grade(
                new BigDecimal(command.gradeValue()),
                new BigDecimal(command.maxScore())
        );

        submission.grade(grade, command.feedback());
        submissionRepository.save(submission);
    }

    @Override
    public void returnSubmissionForRevision(ReturnSubmissionCommand command) {
        Submission submission = findSubmissionByIdOrThrow(SubmissionId.fromString(command.submissionId()));
        submission.returnForRevision(command.feedback());
        submissionRepository.save(submission);
    }

    @Override
    public void requestAIAnalysis(SubmissionId submissionId) {
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        submission.markForAIAnalysis();
        submissionRepository.save(submission);

        // TODO: Publish event or call AI Detection Context
    }

    // ✅ SUBMISSION QUERIES

    @Override
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(SubmissionId submissionId) {
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        return mapToSubmissionDTO(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByAssignment(AssignmentId assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SubmissionDTO> getLatestSubmission(AssignmentId assignmentId, UserId studentId) {
        return submissionRepository.findLatestByAssignmentAndStudent(assignmentId, studentId)
                .map(this::mapToSubmissionDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStatus(SubmissionStatus status) {
        List<Submission> submissions = submissionRepository.findByStatus(status);
        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getLateSubmissions(AssignmentId assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        if (assignment.getDueDate() == null) {
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
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        int total = submissions.size();
        int graded = (int) submissions.stream()
                .filter(Submission::isGraded)
                .count();
        int pending = (int) submissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED)
                .count();
        int returned = (int) submissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.RETURNED)
                .count();

        BigDecimal avgGrade = submissions.stream()
                .filter(Submission::isGraded)
                .map(s -> s.getGrade().getValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(graded > 0 ? graded : 1), 2, BigDecimal.ROUND_HALF_UP);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        int late = assignment.getDueDate() != null
                ? (int) submissions.stream()
                .filter(s -> s.isLate(assignment.getDueDate()))
                .count()
                : 0;

        int onTime = total - late;

        StatusDistributionDTO statusDist = new StatusDistributionDTO(
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.DRAFT).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.GRADED).count(),
                (int) submissions.stream().filter(s -> s.getStatus() == SubmissionStatus.RETURNED).count()
        );

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
        List<Submission> submissions = submissionRepository.findByAssignmentAndStudent(assignmentId, studentId);
        return !submissions.isEmpty();
    }

    // ✅ PRIVATE HELPER METHODS

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException("Submission not found: " + submissionId.getValue()));
    }

    private SubmissionDTO mapToSubmissionDTO(Submission submission) {
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
                        doc.getStoragePath(),
                        doc.getCreatedAt().toString(),
                        "SUBMISSION" // ✅ Get from entity
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