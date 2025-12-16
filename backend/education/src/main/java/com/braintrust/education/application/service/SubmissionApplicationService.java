package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.application.ports.out.TextExtractionProvider;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.Maps.AIAnalysisMapper;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.AssignmentService;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.in.UnitGradeService;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.StudentGroupNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionApplicationService implements SubmissionService {

    private static final Logger log = LoggerFactory.getLogger(SubmissionApplicationService.class);

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final DocumentStorageService documentStorageService;
    private final AnalysisApplicationService analysisApplicationService;
    private final TextExtractionProvider textExtractionProvider;
    private final AIDetectionProvider aiDetectionProvider;
    private final GradebookService gradebookService;
    private final StudentGroupRepository studentGroupRepository;
    private final UnitGradeService unitGradeService;
    private final UserService userService;
    private final AssignmentService assignmentService;

    @Value("${ai.model-default-type:ENSEMBLE}")
    private String MODEL_IA;

    @Value("${submission.ai-analysis.enabled:true}")
    private boolean aiAnalysisEnabled;

    @Value("${submission.ai-analysis.min-text-length:50}")
    private int minTextLengthForAnalysis;

    @Value("${submission.content.empty-placeholder:Submitted with attachments}")
    private String emptyContentPlaceholder;

    private final Semaphore storageRateLimiter = new Semaphore(20);
    private final Semaphore extractionRateLimiter = new Semaphore(10);
    private final AIAnalysisMapper aiAnalysisMapper;

    public SubmissionApplicationService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            DocumentStorageService documentStorageService,
            AnalysisApplicationService analysisApplicationService,
            TextExtractionProvider textExtractionProvider,
            AIDetectionProvider aiDetectionProvider,
            GradebookService gradebookService,
            StudentGroupRepository studentGroupRepository,
            UnitGradeService unitGradeService,
            UserService userService,
            AssignmentService assignmentService, AIAnalysisMapper aiAnalysisMapper) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.documentStorageService = documentStorageService;
        this.analysisApplicationService = analysisApplicationService;
        this.textExtractionProvider = textExtractionProvider;
        this.aiDetectionProvider = aiDetectionProvider;
        this.gradebookService = gradebookService;
        this.studentGroupRepository = studentGroupRepository;
        this.unitGradeService = unitGradeService;
        this.userService = userService;
        this.assignmentService = assignmentService;
        this.aiAnalysisMapper = aiAnalysisMapper;

        log.info("✅ SubmissionApplicationService initialized");
    }

    // ========================================
    // ✅ SUBMISSION CREATION METHODS (unchanged)
    // ========================================


    private SubmissionId submitTeamWithFrontendExtraction(String assignmentIdStr,
                                                          String groupIdStr,
                                                          String studentSenderIdStr,
                                                          String content,
                                                          List<FrontendDocumentDTOSub> frontendDocuments
    ) {
        AssignmentId assignmentId = AssignmentId.fromString(assignmentIdStr);
        StudentGroupId teamId = StudentGroupId.fromString(groupIdStr);
        UserId senderId = UserId.fromString(studentSenderIdStr);

        log.info("🚀 Team submission (Frontend extraction) - Team {} for Assignment {} by Student {}",
                teamId.getValue(), assignmentId.getValue(), senderId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));


            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();


            if (!assignment.isTeamAssignment()) {
                throw new IllegalStateException("This assignment is not configured for teams");
            }

            if (!assignment.canAcceptSubmissions()) {
                throw new IllegalStateException("Assignment is closed and cannot accept submissions");
            }

            StudentGroup team = studentGroupRepository.findById(teamId)
                    .orElseThrow(() -> new StudentGroupNotFoundException("Team not found"));

            // ✅ Store documents with frontend-extracted text
            List<Document> documents = storeFrontendDocuments(assignmentId.getValue(), frontendDocuments);

            // ✅ Combine extracted texts for AI analysis
           // String combinedExtractedText = combineExtractedTexts(frontendDocuments);

            UserId firstMember = UserId.fromString(studentSenderIdStr);

            // Store minimal content in submission
            String submissionContent = emptyContentPlaceholder;

            Submission submission = Submission.create(
                    assignmentId,
                    firstMember,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("✅ Team submission created for group: {} (Submitted by: {}, Format: {})",
                    teamId.getValue(), firstMember.getValue(), submissionFormat.name());

            createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            // Trigger AI analysis with extracted text
            if (shouldTriggerAIAnalysis(submissionFormat, documents, content)) {
                triggerAIAnalysisAsync(savedSubmission.getId(), content, submissionFormat);
            } else {
                logAIAnalysisSkipReason(submissionFormat, documents, content, "team");
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed team submission with frontend extraction: {}", e.getMessage(), e);
            throw new RuntimeException("Team submission failed: " + e.getMessage(), e);
        }
    }






    @Override
    public SubmissionId submitTeamAssignment(SubmitTeamAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        StudentGroupId teamId = StudentGroupId.fromString(command.groupId());

        log.info("🚀 Team {} submitting work for Assignment {}",
                teamId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();
            log.info("📋 Team assignment {} has submission format: {}",
                    assignmentId.getValue(), submissionFormat.name());

            if (!assignment.isTeamAssignment()) {
                throw new IllegalStateException("This assignment is not configured for teams");
            }

            StudentGroup team = studentGroupRepository.findById(teamId)
                    .orElseThrow(() -> new StudentGroupNotFoundException("Team not found"));

            List<Document> documents = new ArrayList<>();
            String extractedText = "";

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                List<DocumentMetadata> metadataList = storeDocumentsWithRateLimit(
                        assignmentId.getValue(),
                        command.attachments()
                );

                documents = metadataList.stream()
                        .map(metadata -> new Document(
                                metadata.getOriginalFilename(),
                                metadata.getStoragePath()
                        ))
                        .collect(Collectors.toList());

                log.info("📁 {} documents stored for team submission", documents.size());

                // Extract text from PDFs
                if (submissionFormat == SubmissionFormat.DIGITAL && !documents.isEmpty()) {
                    extractedText = extractTextFromFirstPdf(command.attachments());
                }
            }

            UserId firstMember = UserId.fromString(command.studentSenderId());

            // Store minimal content in submission
            String submissionContent = emptyContentPlaceholder;

            Submission submission = Submission.create(
                    assignmentId,
                    firstMember,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("✅ Team submission created for group: {} (Submitted by: {}, Format: {})",
                    teamId.getValue(), firstMember.getValue(), submissionFormat.name());

            createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            // Trigger AI analysis with extracted text
            if (shouldTriggerAIAnalysis(submissionFormat, documents, extractedText)) {
                triggerAIAnalysisAsync(savedSubmission.getId(), extractedText, submissionFormat);
            } else {
                logAIAnalysisSkipReason(submissionFormat, documents, extractedText, "team");
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed to submit team assignment for Group {}: {}",
                    command.groupId(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit team assignment", e);
        }
    }



    public SubmissionId submitAssignmentFrontend(SubmitAssignmentFrontendDTO command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("🚀 Frontend extraction - Student {} submitting Assignment {}",
                studentId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            // ✅ Combine extracted texts from all documents
            String combinedExtractedText = combineExtractedTexts(command.frontendDocuments());

            List<Document> documents = storeFrontendDocuments(assignmentId.getValue(), command.frontendDocuments());

            // ✅ Use content from frontend
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

            log.info("✅ Frontend extraction submission created: {}", savedSubmission.getId().getValue());

            // ✅ Trigger AI analysis with COMBINED extracted text
            // Use combinedExtractedText if available, otherwise fall back to content
            String textForAnalysis = combinedExtractedText.isEmpty() ?
                    command.content() : combinedExtractedText;

            if (shouldTriggerAIAnalysis(submissionFormat, documents, textForAnalysis)) {
                triggerAIAnalysisAsync(savedSubmission.getId(), textForAnalysis, submissionFormat);
            } else {
                logAIAnalysisSkipReason(submissionFormat, documents, textForAnalysis, "individual");
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed frontend extraction submission: {}", e.getMessage(), e);
            throw new RuntimeException("Frontend extraction submission failed", e);
        }
    }
    @Override
    public SubmissionId submitTeamAssignmentFrontend(SubmitTeamAssignmentFrontendDTO command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        StudentGroupId teamId = StudentGroupId.fromString(command.groupId());
        UserId senderId = UserId.fromString(command.studentSenderId());

        log.info("🚀 Team frontend extraction - Team {} for Assignment {} by Student {}",
                teamId.getValue(), assignmentId.getValue(), senderId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();

            if (!assignment.isTeamAssignment()) {
                throw new IllegalStateException("This assignment is not configured for teams");
            }

            if (!assignment.canAcceptSubmissions()) {
                throw new IllegalStateException("Assignment is closed and cannot accept submissions");
            }

            StudentGroup team = studentGroupRepository.findById(teamId)
                    .orElseThrow(() -> new StudentGroupNotFoundException("Team not found"));

            // Store documents with frontend-extracted text
            List<Document> documents = storeFrontendDocuments(assignmentId.getValue(), command.frontendDocuments());

            // ✅ Combine extracted texts from all documents for AI analysis
            String combinedExtractedText = combineExtractedTexts(command.frontendDocuments());

            String submissionContent = getSubmissionContent(command.content());

            Submission submission = Submission.create(
                    assignmentId,
                    senderId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("✅ Team frontend extraction submission created for group: {}",
                    teamId.getValue());

            createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            // ✅ Trigger AI analysis with COMBINED extracted text
            // Use combinedExtractedText if available, otherwise fall back to content
            String textForAnalysis = combinedExtractedText.isEmpty() ?
                    command.content() : combinedExtractedText;

            if (shouldTriggerAIAnalysis(submissionFormat, documents, textForAnalysis)) {
                triggerAIAnalysisAsync(savedSubmission.getId(), textForAnalysis, submissionFormat);
            } else {
                logAIAnalysisSkipReason(submissionFormat, documents, textForAnalysis, "team");
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed team frontend extraction submission: {}", e.getMessage(), e);
            throw new RuntimeException("Team frontend extraction submission failed", e);
        }
    }

    /**
     * Combine extracted texts from all frontend documents
     */
    private String combineExtractedTexts(List<FrontendDocumentDTOSub> frontendDocuments) {
        if (frontendDocuments == null || frontendDocuments.isEmpty()) {
            return "";
        }

        StringBuilder combinedText = new StringBuilder();

        for (FrontendDocumentDTOSub document : frontendDocuments) {
            if (document.extractedText() != null && !document.extractedText().trim().isEmpty()) {
                // Add separator between documents
                if (combinedText.length() > 0) {
                    combinedText.append("\n\n--- Document: ").append(document.originalFilename()).append(" ---\n\n");
                } else {
                    combinedText.append("--- Document: ").append(document.originalFilename()).append(" ---\n\n");
                }
                combinedText.append(document.extractedText().trim());
            }
        }

        String result = combinedText.toString().trim();
        log.info("📝 Combined {} documents into {} characters of text",
                frontendDocuments.size(), result.length());

        return result;
    }

    @Override
    public SubmissionId submitAssignment(SubmitAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Student {} submitting work for Assignment {}",
                studentId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            SubmissionFormat submissionFormat = assignment.getSubmissionFormat();
            log.info("📋 Assignment {} has submission format: {}",
                    assignmentId.getValue(), submissionFormat.name());

            if (!assignment.canAcceptSubmissions()) {
                throw new IllegalStateException("Assignment is closed and cannot accept submissions");
            }

            List<Document> documents = new ArrayList<>();
            String extractedText = "";

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                long storageStart = System.currentTimeMillis();
                List<DocumentMetadata> metadataList = storeDocumentsWithRateLimit(
                        assignmentId.getValue(),
                        command.attachments()
                );
                long storageDuration = System.currentTimeMillis() - storageStart;

                documents = metadataList.stream()
                        .map(metadata -> new Document(
                                metadata.getOriginalFilename(),
                                metadata.getStoragePath()
                        ))
                        .collect(Collectors.toList());

                log.info("📁 {} documents stored in {}ms", documents.size(), storageDuration);

                // Extract text from PDFs
                if (submissionFormat == SubmissionFormat.DIGITAL && !documents.isEmpty()) {
                    extractedText = extractTextFromFirstPdf(command.attachments());
                }
            } else {
                log.info("📝 Submission without attachments");
            }

            // Store minimal content in submission
            String submissionContent = command.content() != null && !command.content().trim().isEmpty()
                    ? command.content().trim()
                    : emptyContentPlaceholder;

            Submission submission = Submission.create(
                    assignmentId,
                    studentId,
                    submissionContent,
                    documents,
                    SubmissionStatus.SUBMITTED
            );

            Submission savedSubmission = submissionRepository.save(submission);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("✅ Submission {} created in {}ms (Attachments: {}, Format: {})",
                    savedSubmission.getId().getValue(), totalDuration,
                    documents.size(), submissionFormat.name());

            // Trigger AI analysis with extracted text
            if (shouldTriggerAIAnalysis(submissionFormat, documents, extractedText)) {
                triggerAIAnalysisAsync(savedSubmission.getId(), extractedText, submissionFormat);
            } else {
                logAIAnalysisSkipReason(submissionFormat, documents, extractedText, "individual");
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed to submit assignment for Student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit assignment", e);
        }
    }

    // ========================================
    // ✅ ASYNC AI ANALYSIS (unchanged)
    // ========================================

    @Async("virtualTaskExecutor")
    public void triggerAIAnalysisAsync(
            SubmissionId submissionId,
            String extractedText,
            SubmissionFormat submissionFormat) {

        if (!aiAnalysisEnabled) {
            log.info("🤖 AI analysis is disabled. Skipping for submission {}", submissionId.getValue());
            return;
        }

        if (submissionFormat != SubmissionFormat.DIGITAL) {
            log.warn("⚠️ AI analysis attempted for non-DIGITAL submission {} (Format: {}). Skipping.",
                    submissionId.getValue(), submissionFormat.name());
            return;
        }

        if (extractedText == null || extractedText.trim().isEmpty() ||
                extractedText.length() < minTextLengthForAnalysis) {
            log.warn("⚠️ Extracted text too short for AI analysis ({} chars). Minimum required: {}. Skipping.",
                    extractedText != null ? extractedText.length() : 0, minTextLengthForAnalysis);
            return;
        }

        log.info("🤖 Starting async AI analysis for Submission {} (Text length: {} chars)",
                submissionId.getValue(), extractedText.length());
        long startTime = System.currentTimeMillis();

        try {
            analysisApplicationService.analyzeSubmission(
                    new AnalyzeSubmissionCommand(
                            submissionId.getValue(),
                            extractedText,
                            MODEL_IA
                    )
            );

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ AI analysis completed for Submission {} in {}ms",
                    submissionId.getValue(), duration);

        } catch (Exception e) {
            log.error("❌ AI analysis failed for Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
        }
    }

    // ========================================
    // ✅ QUERY METHODS - Updated to use aiAnalysis.detectedSegments()
    // ========================================

    @Override
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(SubmissionId submissionId) {
        log.debug("📊 Fetching Submission DTO by ID: {}", submissionId.getValue());
        Submission submission = findSubmissionByIdOrThrow(submissionId);

        // Get AI analysis results for this submission
        AIDetectionResultDTO aiAnalysis = getAIAnalysisForSubmission(submissionId);

        return mapToSubmissionDTO(submission, aiAnalysis);
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
                    AIDetectionResultDTO aiAnalysis = getAIAnalysisForSubmission(submission.getId());
                    return mapToSubmissionDTO(submission, aiAnalysis);
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
                    AIDetectionResultDTO aiAnalysis = getAIAnalysisForSubmission(submission.getId());
                    return mapToSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        log.debug("📊 Fetching all submissions by Student: {}", studentId.getValue());

        List<Submission> submissions = submissionRepository.findByStudentId(studentId);

        return submissions.stream()
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = getAIAnalysisForSubmission(submission.getId());
                    return mapToSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudentAndCourse(UserId studentId, CourseId courseId) {
        log.debug("📊 Fetching submissions for Student: {} in Course: {}",
                studentId.getValue(), courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseAndStudent(courseId, studentId);

        return submissions.stream()
                .map(submission -> {
                    AIDetectionResultDTO aiAnalysis = getAIAnalysisForSubmission(submission.getId());
                    return mapToSubmissionDTO(submission, aiAnalysis);
                })
                .collect(Collectors.toList());
    }

    // ========================================
    // ✅ HELPER METHODS - AI Analysis Extraction
    // ========================================

    /**
     * Get AI analysis summary for a submission
     */
    private AIDetectionResultDTO getAIAnalysisForSubmission(SubmissionId submissionId) {
        List<AnalysisResultDTO> aiAnalyses = analysisApplicationService.getAnalysisBySubmission(submissionId.getValue());

        if (aiAnalyses == null || aiAnalyses.isEmpty()) {
            return null;
        }

        // Get the most recent completed analysis
        return aiAnalyses.stream()
                .filter(analysis -> "COMPLETED".equals(analysis.status()))
                .max((a1, a2) -> {
                    if (a1.analyzedAt() != null && a2.analyzedAt() != null) {
                        return a1.analyzedAt().compareTo(a2.analyzedAt());
                    }
                    return 0;
                })
                .map(analysis -> new AIDetectionResultDTO(
                        analysis.id(),           // analysisId
                        analysis.submissionId(), // submissionId
                        analysis.probability(),  // probability
                        analysis.percentage(),   // percentage
                        analysis.modelUsed(),    // modelUsed
                        analysis.confidenceLevel(), // confidenceLevel
                        analysis.isLikelyAI(),   // isLikelyAI
                        analysis.isUncertain(),  // isUncertain
                        analysis.isLikelyHuman(), // isLikelyHuman
                        analysis.status(),       // status
                        analysis.analyzedAt(),   // analyzedAt
                        analysis.errorMessage(), // errorMessage
                        analysis.detectedSegments(), // ✅ detectedSegments
                        analysis.metadata()      // ✅ metadata
                ))
                .orElse(null);
    }

    // ========================================
    // ✅ MAPPING METHODS - Updated
    // ========================================

    /**
     * Map submission to DTO with AI analysis
     */
    private SubmissionDTO mapToSubmissionDTO(Submission submission, AIDetectionResultDTO aiAnalysis) {
        try {
            String studentName = getStudentName(submission.getStudentId());
            String assignmentTitle = getAssignmentTitle(submission.getAssignmentId());
            String teamName = getTeamName(submission.getTeamId());

            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                    .orElse(null);

            String assignmentTargetType = assignment != null ?
                    assignment.getTargetType().name() : "UNKNOWN";
            String submissionFormat = assignment != null && assignment.getSubmissionFormat() != null ?
                    assignment.getSubmissionFormat().name() : "DIGITAL";

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

            boolean isLate = assignment != null && assignment.getDueDate() != null
                    ? submission.isLate(assignment.getDueDate())
                    : false;

            boolean isTeamSubmission = submission.getTeamId() != null;
            String teamId = isTeamSubmission ? submission.getTeamId().getValue() : null;

            String unitId = assignment != null && assignment.getUnitId() != null
                    ? assignment.getUnitId().getValue() : null;
            String unitName = "Unit Name";
            String deliveryMode = isTeamSubmission ? "GROUP" : "INDIVIDUAL";
//
            com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO mappedAiAnalysis = null;

            if (aiAnalysis != null) {
                // Use the appropriate mapper method based on your AI analysis type
                // If aiAnalysis is from the AIDetectionResultDTO type:
                mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(aiAnalysis);

                // OR if you have AnalysisResultDTO type:
                // mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(analysisResult);
            }



            return new SubmissionDTO(
                    submission.getId().getValue(),
                    submission.getAssignmentId().getValue(),
                    assignmentTitle,
                    submission.getStudentId().getValue(),
                    studentName,
                    submission.getStatus().name(),
                    gradeDTO,
                    submission.getTeacherFeedback(),
                    submission.getSubmittedAt().toString(),
                    isLate,
                    attachmentDTOs,
                    mappedAiAnalysis, // ✅ Use the mapped AI analysis
                    teamId,
                    teamName,
                    isTeamSubmission,
                    unitId,
                    unitName,
                    deliveryMode,
                    assignmentTargetType,
                    submissionFormat
            );
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());
            return mapToSubmissionDTOFallback(submission, aiAnalysis);
        }
    }

    private SubmissionDTO mapToSubmissionDTOFallback(Submission submission, AIDetectionResultDTO aiAnalysis) {
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElse(null);

        String assignmentTargetType = assignment != null ?
                assignment.getTargetType().name() : "UNKNOWN";
        String submissionFormat = assignment != null && assignment.getSubmissionFormat() != null ?
                assignment.getSubmissionFormat().name() : "DIGITAL";

        GradeDTO gradeDTO = submission.getGrade() != null
                ? new GradeDTO(
                submission.getGrade().getValue().toString(),
                submission.getGrade().getMaxScore().toString(),
                submission.getGrade().getPercentage().toString()
        )
                : null;

        boolean isLate = assignment != null && assignment.getDueDate() != null
                ? submission.isLate(assignment.getDueDate())
                : false;

        String unitId = assignment != null && assignment.getUnitId() != null
                ? assignment.getUnitId().getValue() : null;

        boolean isTeamSubmission = submission.getTeamId() != null;
        String teamId = isTeamSubmission ? submission.getTeamId().getValue() : null;

        List<DocumentDTO> attachmentDTOs = submission.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());


        com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO mappedAiAnalysis = null;

        if (aiAnalysis != null) {
            // Use the appropriate mapper method based on your AI analysis type
            // If aiAnalysis is from the AIDetectionResultDTO type:
            mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(aiAnalysis);

            // OR if you have AnalysisResultDTO type:
            // mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(analysisResult);
        }



        return new SubmissionDTO(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                "",
                submission.getStudentId().getValue(),
                "",
                submission.getStatus().name(),
                gradeDTO,
                submission.getTeacherFeedback(),
                submission.getSubmittedAt().toString(),
                isLate,
                attachmentDTOs,
                mappedAiAnalysis, // ✅ Use the mapped AI analysis
                teamId,
                "",
                isTeamSubmission,
                unitId,
                "",
                "",
                assignmentTargetType,
                submissionFormat
        );
    }


    // Then add this mapping method
    private com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO convertToEducationAIDetectionDTO(AIDetectionResultDTO aiDetectionDTO) {
        if (aiDetectionDTO == null) {
            return null;
        }

        return new com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO(
                aiDetectionDTO.analysisId(),
                aiDetectionDTO.submissionId(),
                aiDetectionDTO.aiProbability(),
                aiDetectionDTO.aiPercentage(),
                aiDetectionDTO.modelUsed(),
                aiDetectionDTO.confidenceLevel(),
                aiDetectionDTO.likelyAI(),
                aiDetectionDTO.uncertain(),
                aiDetectionDTO.likelyHuman(),
                aiDetectionDTO.status(),
                aiDetectionDTO.analyzedAt() != null ? aiDetectionDTO.analyzedAt().toString() : null,
                aiDetectionDTO.errorMessage(),
                aiDetectionDTO.detectedSegments(),
                aiDetectionDTO.metadata()
        );
    }


    // ========================================
    // ✅ OTHER METHODS (mostly unchanged)
    // ========================================

    @Override
    public void gradeTeamSubmission(GradeSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        log.info("🎯 Grading TEAM Submission {} with score: {}/{}",
                submissionId.getValue(), command.gradeValue(), command.maxScore());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);

            if (submission.getTeamId() == null) {
                throw new IllegalStateException("This is not a team submission");
            }

            Grade grade = new Grade(
                    new BigDecimal(command.gradeValue()),
                    new BigDecimal(command.maxScore())
            );

            submission.grade(grade, command.feedback());
            Submission savedSubmission = submissionRepository.save(submission);

            gradebookService.applyTeamGradeToAllMembers(
                    savedSubmission.getAssignmentId(),
                    savedSubmission.getTeamId()
            );

            log.info("✅ Team grade applied to all members of group {} with gradebook & unit updates",
                    savedSubmission.getTeamId().getValue());

        } catch (Exception e) {
            log.error("❌ Failed to grade team submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }





    @Override
    public void gradeSubmission(GradeSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        log.info("📝 Grading Submission {} with score: {}/{}",
                submissionId.getValue(), command.gradeValue(), command.maxScore());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);

            Grade grade = new Grade(
                    new BigDecimal(command.gradeValue()),
                    new BigDecimal(command.maxScore())
            );

            submission.grade(grade, command.feedback());
            Submission savedSubmission = submissionRepository.save(submission);

            Assignment assignment = assignmentRepository.findById(savedSubmission.getAssignmentId())
                    .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

            if (assignment.getUnitId() != null) {
                unitGradeService.addAssignmentGradeToUnit(
                        assignment.getUnitId(),
                        savedSubmission.getStudentId(),
                        assignment.getId(),
                        grade
                );

                gradebookService.syncUnitGrade(
                        assignment.getCourseId(),
                        savedSubmission.getStudentId(),
                        assignment.getUnitId()
                );
            }

            if (savedSubmission.getTeamId() != null && assignment.isTeamAssignment()) {
                gradebookService.applyTeamGradeToAllMembers(
                        assignment.getId(),
                        savedSubmission.getTeamId()
                );
            } else {
                gradebookService.syncAssignmentGrade(
                        assignment.getCourseId(),
                        savedSubmission.getStudentId(),
                        savedSubmission.getAssignmentId()
                );
            }

            log.info("✅ Submission {} graded successfully", submissionId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to grade Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }


    @Override
    public void deleteSubmission(SubmissionId submissionId) {
        log.warn("🗑️ Deleting submission ID: {}", submissionId.getValue());

        Submission submission = findSubmissionByIdOrThrow(submissionId);
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        CourseId courseId = assignment.getCourseId();
        UserId studentId = submission.getStudentId();
        UnitId unitId = assignment.getUnitId();

        boolean affectsUnitGrade = submission.isGraded() && unitId != null;

        if (affectsUnitGrade) {
            unitGradeService.removeAssignmentGradeFromUnit(unitId, studentId, assignment.getId());
            gradebookService.syncUnitGrade(courseId, studentId, unitId);
        }

        submissionRepository.delete(submission);
        log.info("✅ Submission deleted and grade REMOVED from unit grade");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isTeamSubmission(SubmissionId submissionId) {
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        return submission.getTeamId() != null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId) {
        log.debug("Fetching submissions for Course: {} with basic info", courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseId(courseId);

        return submissions.stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }

    private SubmissionBasicDTO mapToBasicDTO(Submission submission) {
        try {
            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                    .orElse(null);

            String studentName = getStudentName(submission.getStudentId());

            return new SubmissionBasicDTO(
                    submission.getId().getValue(),
                    submission.getAssignmentId().getValue(),
                    assignment != null ? assignment.getTitle() : "Unknown Assignment",
                    submission.getStudentId().getValue(),
                    studentName,
                    submission.getStatus().name(),
                    submission.getSubmittedAt().toString(),
                    submission.getGrade() != null ? submission.getGrade().getValue().toString() : null,
                    submission.getGrade() != null ? submission.getGrade().getMaxScore().toString() : null,
                    submission.getTeamId() != null,
                    submission.getTeamId() != null ? submission.getTeamId().getValue() : null
            );
        } catch (Exception e) {
            log.warn("Failed to get real data for basic submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());

            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                    .orElse(null);

            return new SubmissionBasicDTO(
                    submission.getId().getValue(),
                    submission.getAssignmentId().getValue(),
                    assignment != null ? assignment.getTitle() : "Unknown Assignment",
                    submission.getStudentId().getValue(),
                    "Student Name",
                    submission.getStatus().name(),
                    submission.getSubmittedAt().toString(),
                    submission.getGrade() != null ? submission.getGrade().getValue().toString() : null,
                    submission.getGrade() != null ? submission.getGrade().getMaxScore().toString() : null,
                    submission.getTeamId() != null,
                    submission.getTeamId() != null ? submission.getTeamId().getValue() : null
            );
        }
    }

    // ========================================
    // ✅ PRIVATE HELPER METHODS (text extraction, etc.)
    // ========================================

    private String extractTextFromFirstPdf(List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return "";
        }

        MultipartFile pdfFile = attachments.stream()
                .filter(file -> file.getContentType() != null &&
                        file.getContentType().equals("application/pdf"))
                .findFirst()
                .orElse(null);

        if (pdfFile == null) {
            return "";
        }

        log.info("📄 Extracting text from PDF: {} (size: {} bytes)",
                pdfFile.getOriginalFilename(), pdfFile.getSize());

        try {
            extractionRateLimiter.acquire();
            try {
                long startTime = System.currentTimeMillis();
                String extractedText = textExtractionProvider.extractTextFromPdf(pdfFile);
                long duration = System.currentTimeMillis() - startTime;

                int wordCount = extractedText.split("\\s+").length;
                log.info("✅ Text extraction completed in {}ms. Words: {}",
                        duration, wordCount);

                return extractedText.trim();

            } finally {
                extractionRateLimiter.release();
            }
        } catch (Exception e) {
            log.error("❌ Failed to extract text from PDF: {}", e.getMessage());
            return "";
        }
    }

    private boolean shouldTriggerAIAnalysis(SubmissionFormat format,
                                            List<Document> documents,
                                            String extractedText) {
        ///if (!aiAnalysisEnabled) return false;
        if (format != SubmissionFormat.DIGITAL) return false;
        //if (documents.isEmpty()) return false;
        //if (extractedText == null || extractedText.trim().isEmpty() ||
          //      extractedText.length() < minTextLengthForAnalysis) {
            //return false;
        //}
        return true;

    }

    private boolean shouldTriggerAIAnalysisFrontends(SubmissionFormat format,
                                            String extractedText) {
        if (!aiAnalysisEnabled) return false;
        if (format != SubmissionFormat.DIGITAL) return false;
        if (extractedText == null || extractedText.trim().isEmpty() ||
                extractedText.length() < minTextLengthForAnalysis) {
            return false;
        }
        return true;
    }

    private void logAIAnalysisSkipReason(SubmissionFormat format,
                                         List<Document> documents,
                                         String extractedText,
                                         String submissionType) {
        if (!aiAnalysisEnabled) {
            log.info("⏭️ AI analysis disabled globally for {} submission", submissionType);
            return;
        }

        if (format != SubmissionFormat.DIGITAL) {
            log.info("📓 Skipping AI analysis for {} submission - {} format",
                    submissionType, format.name());
            return;
        }

        if (documents.isEmpty()) {
            log.info("⏭️ Skipping AI analysis for {} submission - no documents", submissionType);
            return;
        }

        if (extractedText == null || extractedText.trim().isEmpty()) {
            log.info("⏭️ Skipping AI analysis for {} submission - no text extracted", submissionType);
            return;
        }

        if (extractedText.length() < minTextLengthForAnalysis) {
            log.info("⏭️ Skipping AI analysis for {} submission - extracted text too short ({} chars < {})",
                    submissionType, extractedText.length(), minTextLengthForAnalysis);
        }
    }

    private List<DocumentMetadata> storeDocumentsWithRateLimit(String targetId,
                                                               List<MultipartFile> files) {
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

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException(
                        "Submission not found: " + submissionId.getValue()));
    }

    private void createShadowSubmissionsForTeamMembers(StudentGroup team,
                                                       AssignmentId assignmentId,
                                                       Submission mainSubmission,
                                                       StudentGroupId teamId) {
        int shadowCount = 0;

        for (UserId memberId : team.getMemberIds()) {
            if (memberId.equals(mainSubmission.getStudentId())) {
                continue;
            }

            try {
                Submission shadowSubmission = Submission.create(
                        assignmentId,
                        memberId,
                        mainSubmission.getContent(),
                        mainSubmission.getAttachments(),
                        SubmissionStatus.SUBMITTED,
                        teamId
                );

                submissionRepository.save(shadowSubmission);
                shadowCount++;

                log.debug("✅ Created shadow submission for team member: {}", memberId.getValue());

            } catch (Exception e) {
                log.error("❌ Failed to create shadow submission for team member {}: {}",
                        memberId.getValue(), e.getMessage());
            }
        }

        log.info("✅ Created {} shadow submissions for team {}", shadowCount, team.getId().getValue());
    }

    private String getStudentName(UserId studentId) {
        try {
            MinimalUserInfoDTO userInfo = userService.getMinimalUserInfo(studentId);
            return userInfo.fullName();
        } catch (Exception e) {
            log.warn("Failed to get student name for user {}, using fallback", studentId.getValue());
            return "Student Name";
        }
    }

    private String getAssignmentTitle(AssignmentId assignmentId) {
        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElse(null);
            return assignment != null ? assignment.getTitle() : "Unknown Assignment";
        } catch (Exception e) {
            log.warn("Failed to get assignment title for assignment {}, using fallback", assignmentId.getValue());
            return "Unknown Assignment";
        }
    }

    private String getTeamName(StudentGroupId teamId) {
        if (teamId == null) return null;

        try {
            StudentGroup team = studentGroupRepository.findById(teamId)
                    .orElse(null);
            return team != null ? team.getName() : "Unknown Team";
        } catch (Exception e) {
            log.warn("Failed to get team name for team {}, using fallback", teamId.getValue());
            return "Unknown Team";
        }
    }


    private List<Document> storeFrontendDocuments(String targetId,
                                                  List<FrontendDocumentDTOSub> frontendDocuments) {
        List<Document> documents = new ArrayList<>();

        if (frontendDocuments != null && !frontendDocuments.isEmpty()) {
            try {
                storageRateLimiter.acquire();
                try {
                    List<DocumentMetadata> metadataList = documentStorageService.storeDocumentFromFrontendSub(
                            targetId,
                            frontendDocuments
                    );

                    documents = metadataList.stream()
                            .map(metadata -> new Document(
                                    metadata.getOriginalFilename(),
                                    metadata.getStoragePath()
                            ))
                            .collect(Collectors.toList());

                    log.info("📁 {} frontend documents stored for submission {}",
                            documents.size(), targetId);

                } finally {
                    storageRateLimiter.release();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Document storage interrupted", e);
            }
        }

        return documents;
    }

    private String getSubmissionContent(String content) {
        return content != null && !content.trim().isEmpty()
                ? content.trim()
                : emptyContentPlaceholder;
    }

}