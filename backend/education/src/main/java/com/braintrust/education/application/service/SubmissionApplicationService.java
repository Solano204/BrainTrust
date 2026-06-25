package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.helpers.submission.*;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.StudentGroupNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionApplicationService implements SubmissionService {

    private static final Logger log = LoggerFactory.getLogger(SubmissionApplicationService.class);

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentGroupRepository studentGroupRepository;

    private final SubmissionProcessor submissionProcessor;
    private final SubmissionDtoMapper submissionDtoMapper;
    private final SubmissionAIAnalysisHelper aiAnalysisHelper;
    private final SubmissionGradingHelper gradingHelper;
    private final TeamSubmissionHelper teamSubmissionHelper;
    private final StudentHistoryHelper studentHistoryHelper;

    public SubmissionApplicationService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            StudentGroupRepository studentGroupRepository,
            SubmissionProcessor submissionProcessor,
            SubmissionDtoMapper submissionDtoMapper,
            SubmissionAIAnalysisHelper aiAnalysisHelper,
            SubmissionGradingHelper gradingHelper,
            TeamSubmissionHelper teamSubmissionHelper,
            StudentHistoryHelper studentHistoryHelper) {

        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.submissionProcessor = submissionProcessor;
        this.submissionDtoMapper = submissionDtoMapper;
        this.aiAnalysisHelper = aiAnalysisHelper;
        this.gradingHelper = gradingHelper;
        this.teamSubmissionHelper = teamSubmissionHelper;
        this.studentHistoryHelper = studentHistoryHelper;

        log.info("SubmissionApplicationService initialized");
    }

    @Override
    public SubmissionId submitAssignment(SubmitAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());
        long startTime = System.currentTimeMillis();

        log.info("Student submitting assignment studentId={} assignmentId={}",
                studentId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentOrThrow(assignmentId);
            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            validateAssignmentCanAcceptSubmissions(assignment);

            List<Document> documents = new ArrayList<>();
            String extractedText = "";

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                long storageStart = System.currentTimeMillis();
                List<DocumentMetadata> metadataList = submissionProcessor.storeDocumentsWithRateLimit(
                        assignmentId.getValue(),
                        command.attachments()
                );
                long storageDuration = System.currentTimeMillis() - storageStart;

                documents = submissionProcessor.convertToDocuments(metadataList);

                log.info("Documents stored count={} durationMs={}", documents.size(), storageDuration);

                if (submissionFormat == SubmissionFormat.DIGITAL && !documents.isEmpty()) {
                    extractedText = submissionProcessor.extractTextFromFirstPdf(command.attachments());
                }
            }

            String submissionContent = submissionProcessor.getSubmissionContent(command.content());

            Submission submission = Submission.create(
                    assignmentId,
                    studentId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED
            );

            Submission savedSubmission = submissionRepository.save(submission);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("Submission created id={} durationMs={} attachments={} format={}",
                    savedSubmission.getId().getValue(), totalDuration,
                    documents.size(), submissionFormat.name());

            triggerAIAnalysisIfNeeded(savedSubmission.getId(), extractedText, submissionFormat, documents, "individual");

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("Failed to submit assignment studentId={}: {}", studentId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit assignment", e);
        }
    }

    @Override
    public SubmissionId submitAssignmentFrontend(SubmitAssignmentFrontendDTO command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Frontend submission studentId={} assignmentId={}",
                studentId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentOrThrow(assignmentId);
            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            String combinedExtractedText = submissionProcessor.combineExtractedTexts(command.frontendDocuments());
            List<Document> documents = submissionProcessor.storeFrontendDocuments(
                    assignmentId.getValue(),
                    command.frontendDocuments()
            );

            String submissionContent = command.content() != null && !command.content().trim().isEmpty()
                    ? command.content().trim()
                    : "Submitted with frontend-extracted documents";

            Submission submission = Submission.create(
                    assignmentId,
                    studentId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("Frontend submission created id={}", savedSubmission.getId().getValue());

            String textForAnalysis = combinedExtractedText.isEmpty() ? command.content() : combinedExtractedText;
            triggerAIAnalysisIfNeeded(savedSubmission.getId(), textForAnalysis, submissionFormat, documents, "individual");

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("Frontend submission failed: {}", e.getMessage(), e);
            throw new RuntimeException("Frontend extraction submission failed", e);
        }
    }

    @Override
    public SubmissionId submitTeamAssignment(SubmitTeamAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        StudentGroupId teamId = StudentGroupId.fromString(command.groupId());

        log.info("Team submitting assignment teamId={} assignmentId={}",
                teamId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = findAssignmentOrThrow(assignmentId);
            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            teamSubmissionHelper.validateTeamAssignment(assignment);

            StudentGroup team = findStudentGroupOrThrow(teamId);

            List<Document> documents = new ArrayList<>();
            String extractedText = "";

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                List<DocumentMetadata> metadataList = submissionProcessor.storeDocumentsWithRateLimit(
                        assignmentId.getValue(),
                        command.attachments()
                );

                documents = submissionProcessor.convertToDocuments(metadataList);

                log.info("Team submission documents stored count={}", documents.size());

                if (submissionFormat == SubmissionFormat.DIGITAL && !documents.isEmpty()) {
                    extractedText = submissionProcessor.extractTextFromFirstPdf(command.attachments());
                }
            }

            UserId senderId = UserId.fromString(command.studentSenderId());
            String submissionContent = submissionProcessor.getEmptyContentPlaceholder();

            Submission submission = Submission.create(
                    assignmentId,
                    senderId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("Team submission created groupId={} submittedBy={} format={}",
                    teamId.getValue(), senderId.getValue(), submissionFormat.name());

            teamSubmissionHelper.createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            triggerAIAnalysisIfNeeded(savedSubmission.getId(), extractedText, submissionFormat, documents, "team");

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("Failed to submit team assignment groupId={}: {}", command.groupId(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit team assignment", e);
        }
    }

    @Override
    public SubmissionId submitTeamAssignmentFrontend(SubmitTeamAssignmentFrontendDTO command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        StudentGroupId teamId = StudentGroupId.fromString(command.groupId());
        UserId senderId = UserId.fromString(command.studentSenderId());

        log.info("Team frontend submission teamId={} assignmentId={} senderId={}",
                teamId.getValue(), assignmentId.getValue(), senderId.getValue());

        try {
            Assignment assignment = findAssignmentOrThrow(assignmentId);
            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            teamSubmissionHelper.validateTeamAssignment(assignment);

            StudentGroup team = findStudentGroupOrThrow(teamId);

            List<Document> documents = submissionProcessor.storeFrontendDocuments(
                    assignmentId.getValue(),
                    command.frontendDocuments()
            );

            String combinedExtractedText = submissionProcessor.combineExtractedTexts(command.frontendDocuments());
            String submissionContent = submissionProcessor.getSubmissionContent(command.content());

            Submission submission = Submission.create(
                    assignmentId,
                    senderId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("Team frontend submission created groupId={}", teamId.getValue());

            teamSubmissionHelper.createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            String textForAnalysis = combinedExtractedText.isEmpty() ? command.content() : combinedExtractedText;
            triggerAIAnalysisIfNeeded(savedSubmission.getId(), textForAnalysis, submissionFormat, documents, "team");

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("Team frontend submission failed: {}", e.getMessage(), e);
            throw new RuntimeException("Team frontend extraction submission failed", e);
        }
    }

    @Override
    public void gradeSubmission(GradeSubmissionCommand command) {
        gradingHelper.gradeSubmission(command);
    }

    @Override
    public void gradeTeamSubmission(GradeSubmissionCommand command) {
        gradingHelper.gradeTeamSubmission(command);
    }

    @Override
    public void deleteSubmission(SubmissionId submissionId) {
        gradingHelper.deleteSubmission(submissionId);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(SubmissionId submissionId) {
        log.debug("Fetching Submission DTO by ID: {}", submissionId.getValue());
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        AIDetectionResultDTO aiAnalysis = aiAnalysisHelper.getAIAnalysisForSubmission(submissionId);
        return submissionDtoMapper.toSubmissionDTO(submission, aiAnalysis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByCourseAndUnit(CourseId courseId, UnitId unitId) {
        log.debug("Fetching submissions for Course: {} and Unit: {}", courseId.getValue(), unitId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseId(courseId);

        return submissions.stream()
                .filter(submission -> {
                    Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
                    return assignment != null && unitId.equals(assignment.getUnitId());
                })
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = aiAnalysisHelper.getAIAnalysisForSubmission(submission.getId());
                    return submissionDtoMapper.toSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudentAndCourseAndUnit(UserId studentId, CourseId courseId, UnitId unitId) {
        log.debug("Fetching submissions for Student: {}, Course: {}, Unit: {}",
                studentId.getValue(), courseId.getValue(), unitId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseAndStudent(courseId, studentId);

        return submissions.stream()
                .filter(submission -> {
                    Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
                    return assignment != null && unitId.equals(assignment.getUnitId());
                })
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = aiAnalysisHelper.getAIAnalysisForSubmission(submission.getId());
                    return submissionDtoMapper.toSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        log.debug("Fetching all submissions by Student: {}", studentId.getValue());

        List<Submission> submissions = submissionRepository.findByStudentId(studentId);

        return submissions.stream()
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = aiAnalysisHelper.getAIAnalysisForSubmission(submission.getId());
                    return submissionDtoMapper.toSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudentAndCourse(UserId studentId, CourseId courseId) {
        log.debug("Fetching submissions for Student: {} in Course: {}",
                studentId.getValue(), courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseAndStudent(courseId, studentId);

        return submissions.stream()
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = aiAnalysisHelper.getAIAnalysisForSubmission(submission.getId());
                    return submissionDtoMapper.toSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId) {
        log.debug("Fetching submissions for Course: {} with basic info", courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseId(courseId);

        return submissions.stream()
                .map(submissionDtoMapper::toBasicDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isTeamSubmission(SubmissionId submissionId) {
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        return submission.getTeamId() != null;
    }

    private void triggerAIAnalysisIfNeeded(
            SubmissionId submissionId,
            String extractedText,
            SubmissionFormat submissionFormat,
            List<Document> documents,
            String submissionType) {

        if (!aiAnalysisHelper.shouldTriggerAIAnalysis(submissionFormat, documents, extractedText)) {
            aiAnalysisHelper.logAIAnalysisSkipReason(submissionFormat, documents, extractedText, submissionType);
            return;
        }

        int textLen = extractedText != null ? extractedText.length() : 0;
        log.info("AI analysis scheduled after-commit submission={} format={} textLength={}",
                submissionId.getValue(), submissionFormat.name(), textLen);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.info("Triggering async AI analysis post-commit submission={}", submissionId.getValue());
                    aiAnalysisHelper.triggerAIAnalysisAsync(submissionId, extractedText, submissionFormat);
                }
            });
        } else {
            aiAnalysisHelper.triggerAIAnalysisAsync(submissionId, extractedText, submissionFormat);
        }
    }

    private Assignment findAssignmentOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));
    }

    private StudentGroup findStudentGroupOrThrow(StudentGroupId teamId) {
        return studentGroupRepository.findById(teamId)
                .orElseThrow(() -> new StudentGroupNotFoundException("Team not found"));
    }

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException(
                        "Submission not found: " + submissionId.getValue()));
    }

    private void validateAssignmentCanAcceptSubmissions(Assignment assignment) {
        if (!assignment.canAcceptSubmissions()) {
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHistoryDTO getStudentHistory(CourseId courseId, UserId studentId) {
        log.debug("getStudentHistory courseId={} studentId={}", courseId.getValue(), studentId.getValue());
        return studentHistoryHelper.buildStudentHistory(courseId, studentId);
    }
}