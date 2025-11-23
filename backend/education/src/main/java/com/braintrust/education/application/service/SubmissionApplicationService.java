package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
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
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Service
@Transactional
public class SubmissionApplicationService implements SubmissionService {

    private static final Logger log =
            LoggerFactory.getLogger(SubmissionApplicationService.class);

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final DocumentStorageService documentStorageService;
    private final AnalysisApplicationService analysisApplicationService;
    private final GradebookService gradebookService;
    private final StudentGroupRepository studentGroupRepository;
    private final UnitGradeService unitGradeService; // NEW: For restarting unit grade

    @Value("${ai.model-default-type:ENSEMBLE}")
    private String MODEL_IA;

    private final Semaphore storageRateLimiter = new Semaphore(20);

    public SubmissionApplicationService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            DocumentStorageService documentStorageService,
            AnalysisApplicationService analysisApplicationService,
            GradebookService gradebookService,
            StudentGroupRepository studentGroupRepository,
            UnitGradeService unitGradeService) { // NEW: Added UnitGradeService
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.documentStorageService = documentStorageService;
        this.analysisApplicationService = analysisApplicationService;
        this.gradebookService = gradebookService;
        this.studentGroupRepository = studentGroupRepository;
        this.unitGradeService = unitGradeService; // NEW
    }

    // NEW: Get submissions by course with basic info
    @Override
    @Transactional(readOnly = true)
    public List<SubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId) {
        log.debug("Fetching submissions for Course: {} with basic info", courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseId(courseId);

        return submissions.stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }


    @Override
    public SubmissionId submitTeamAssignment(SubmitTeamAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        StudentGroupId teamId = StudentGroupId.fromString(command.groupId());

        log.info("🚀 Team {} submitting work for Assignment {}",
                teamId.getValue(), assignmentId.getValue());

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> {
                        log.warn("❌ Assignment not found: {}", assignmentId.getValue());
                        return new AssignmentNotFoundException("Assignment not found");
                    });

            if (!assignment.isTeamAssignment()) {
                throw new IllegalStateException("This assignment is not configured for teams");
            }

            StudentGroup team = studentGroupRepository.findById(teamId)
                    .orElseThrow(() -> new StudentGroupNotFoundException("Team not found"));

            List<Document> documents = new ArrayList<>();
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
            }

            UserId firstMember = UserId.fromString(command.studentSenderId());

            Submission submission = Submission.create(
                    assignmentId,
                    firstMember,
                    command.content(),
                    documents,
                    SubmissionStatus.SUBMITTED,
                    teamId
            );

            Submission savedSubmission = submissionRepository.save(submission);

            log.info("✅ Team submission created for group: {} (Submitted by: {})",
                    teamId.getValue(), firstMember.getValue());

            createShadowSubmissionsForTeamMembers(team, assignmentId, savedSubmission, teamId);

            if (!documents.isEmpty()) {
                triggerAIAnalysisAsync(savedSubmission.getId(), command.attachments());
            }

            return savedSubmission.getId();

        } catch (Exception e) {
            log.error("❌ Failed to submit team assignment for Group {}: {}",
                    command.groupId(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit team assignment", e);
        }
    }

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

    /*
    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByTeamAndAssignment(StudentGroupId teamId, AssignmentId assignmentId) {
        log.debug("Fetching submissions for Team {} and Assignment {}", teamId.getValue(), assignmentId.getValue());

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId)
                .stream()
                .filter(submission -> teamId.equals(submission.getTeamId()))
                .collect(Collectors.toList());

        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }
    */

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
                        mainSubmission.getContent() + " (Team Submission)",
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

    @Override
    public SubmissionId submitAssignment(SubmitAssignmentCommand command) {
        AssignmentId assignmentId = AssignmentId.fromString(command.assignmentId());
        UserId studentId = UserId.fromString(command.studentId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Student {} submitting work for Assignment {} (Team: {})",
                studentId.getValue(), assignmentId.getValue(), "Individual");

        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> {
                        log.warn("❌ Assignment not found: {}", assignmentId.getValue());
                        return new AssignmentNotFoundException("Assignment not found");
                    });

            if (!assignment.canAcceptSubmissions()) {
                log.warn("❌ Assignment {} is closed", assignmentId.getValue());
                throw new IllegalStateException("Assignment is closed and cannot accept submissions");
            }

            List<Document> documents = new ArrayList<>();
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
            } else {
                log.info("📝 Submission without attachments");
            }

            Submission submission = Submission.create(
                    assignmentId,
                    studentId,
                    command.content(),
                    documents,
                    SubmissionStatus.SUBMITTED
            );

            Submission savedSubmission = submissionRepository.save(submission);

            long totalDuration = System.currentTimeMillis() - startTime;
            log.info("✅ Submission {} created in {}ms (Type: {}, Attachments: {})",
                    savedSubmission.getId().getValue(), totalDuration,
                    "Individual",
                    documents.size());

            if (!documents.isEmpty()) {
                triggerAIAnalysisAsync(savedSubmission.getId(), command.attachments());
            } else {
                log.info("⏭️  Skipping AI analysis - no documents to analyze");
            }

            return savedSubmission.getId();

        } catch (AssignmentNotFoundException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to submit assignment for Student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit assignment", e);
        }
    }

    @Async("virtualTaskExecutor")
    public void triggerAIAnalysisAsync(
            SubmissionId submissionId,
            List<org.springframework.web.multipart.MultipartFile> attachments) {

        log.info("🤖 Starting async AI analysis for Submission {}", submissionId.getValue());
        long startTime = System.currentTimeMillis();

        try {
            analysisApplicationService.analyzePdfSubmission(
                    new AnalyzePdfSubmissionCommand(
                            submissionId.getValue(),
                            attachments,
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

            // ✅ FIXED: Use ADDITIVE approach instead of full recalculation
            if (assignment.getUnitId() != null) {
                log.info("➕ Adding assignment grade to Unit ID: {} for student {}",
                        assignment.getUnitId().getValue(), savedSubmission.getStudentId().getValue());

                // Use the new additive method instead of full recalculation
                unitGradeService.addAssignmentGradeToUnit(
                        assignment.getUnitId(),
                        savedSubmission.getStudentId(),
                        assignment.getId(),
                        grade
                );

                // Still sync to gradebook
                gradebookService.syncUnitGrade(
                        assignment.getCourseId(),
                        savedSubmission.getStudentId(),
                        assignment.getUnitId()
                );
            }

            if (savedSubmission.getTeamId() != null && assignment.isTeamAssignment()) {
                log.info("🎯 Applying team grade to all members of group {}",
                        savedSubmission.getTeamId().getValue());

                gradebookService.applyTeamGradeToAllMembers(
                        assignment.getId(),
                        savedSubmission.getTeamId()
                );

                log.info("✅ Team grade applied to all {} group members",
                        studentGroupRepository.findById(savedSubmission.getTeamId())
                                .map(group -> group.getMemberCount())
                                .orElse(0));
            } else {
                gradebookService.syncAssignmentGrade(
                        assignment.getCourseId(),
                        savedSubmission.getStudentId(),
                        savedSubmission.getAssignmentId()
                );
            }

            log.info("✅ Submission {} graded successfully and unit grade UPDATED (not replaced)", submissionId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to grade Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    /*
    @Override
    public void returnSubmissionForRevision(ReturnSubmissionCommand command) {
        SubmissionId submissionId = SubmissionId.fromString(command.submissionId());

        log.warn("🔄 Returning Submission {} for revision", submissionId.getValue());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);
            submission.returnForRevision(command.feedback());
            submissionRepository.save(submission);

            log.info("✅ Submission {} returned for revision", submissionId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to return Submission {}: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }
    */

    /*
    @Override
    public void requestAIAnalysis(SubmissionId submissionId) {
        log.info("🤖 Marking Submission {} for AI Analysis", submissionId.getValue());

        try {
            Submission submission = findSubmissionByIdOrThrow(submissionId);
            submission.markForAIAnalysis();
            submissionRepository.save(submission);

            log.info("✅ Submission {} marked for AI analysis", submissionId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to mark Submission {} for AI analysis: {}",
                    submissionId.getValue(), e.getMessage(), e);
            throw e;
        }
    }
    */

    @Override
    public void deleteSubmission(SubmissionId submissionId) {
        log.warn("🗑️ Deleting submission ID: {}", submissionId.getValue());

        Submission submission = findSubmissionByIdOrThrow(submissionId);
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        // Store info before deletion for grade removal
        CourseId courseId = assignment.getCourseId();
        UserId studentId = submission.getStudentId();
        UnitId unitId = assignment.getUnitId();

        // Check if the submission is graded and affects unit grade
        boolean affectsUnitGrade = submission.isGraded() && unitId != null;

        // ✅ FIXED: Remove the grade from unit BEFORE deleting the submission
        if (affectsUnitGrade) {
            log.info("➖ Removing assignment grade from Unit ID: {} for student {} before deletion",
                    unitId.getValue(), studentId.getValue());

            // Remove the assignment grade from unit
            unitGradeService.removeAssignmentGradeFromUnit(unitId, studentId, assignment.getId());

            // Also sync to gradebook to ensure course grade is updated
            gradebookService.syncUnitGrade(courseId, studentId, unitId);
        }

        // Delete the submission AFTER removing the grade
        submissionRepository.delete(submission);

        log.info("✅ Submission deleted and grade REMOVED from unit grade");
    }
    // ------------------------------------------------------------------
    // ✅ SUBMISSION QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(SubmissionId submissionId) {
        log.debug("📊 Fetching Submission DTO by ID: {}", submissionId.getValue());
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        return mapToBasicSubmissionDTO(submission); // NEW: Use basic DTO mapping
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByAssignment(AssignmentId assignmentId) {
        log.debug("📊 Fetching all submissions for Assignment: {}", assignmentId.getValue());

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }
    */

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        log.debug("📊 Fetching all submissions by Student: {}", studentId.getValue());

        List<Submission> submissions = submissionRepository.findByStudentId(studentId);

        return submissions.stream()
                .map(this::mapToBasicSubmissionDTO) // NEW: Use basic DTO mapping
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStudentAndCourse(UserId studentId, CourseId courseId) {
        log.debug("📊 Fetching submissions for Student: {} in Course: {}",
                studentId.getValue(), courseId.getValue());

        List<Submission> submissions = submissionRepository.findByCourseAndStudent(courseId, studentId);

        return submissions.stream()
                .map(this::mapToBasicSubmissionDTO) // NEW: Use basic DTO mapping
                .collect(Collectors.toList());
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public Optional<SubmissionDTO> getLatestSubmission(AssignmentId assignmentId, UserId studentId) {
        log.debug("📊 Fetching latest submission for Assignment {} by Student {}",
                assignmentId.getValue(), studentId.getValue());

        return submissionRepository.findLatestByAssignmentAndStudent(assignmentId, studentId)
                .map(this::mapToSubmissionDTO);
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionsByStatus(SubmissionStatus status) {
        log.debug("📊 Fetching submissions with status: {}", status.name());

        List<Submission> submissions = submissionRepository.findByStatus(status);

        return submissions.stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDTO> getLateSubmissions(AssignmentId assignmentId) {
        log.debug("📊 Fetching late submissions for Assignment: {}", assignmentId.getValue());

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        if (assignment.getDueDate() == null) {
            log.warn("⚠️ Cannot determine late submissions for Assignment {} (no due date)",
                    assignmentId.getValue());
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
    */

    @Override
    @Transactional(readOnly = true)
    public boolean isTeamSubmission(SubmissionId submissionId) {
        Submission submission = findSubmissionByIdOrThrow(submissionId);
        log.debug("📊 Calculating analytics for Assignment: {}", submission.getTeamId());

        return submission.getTeamId() != null;
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public SubmissionAnalyticsDTO getSubmissionAnalytics(AssignmentId assignmentId) {
        log.debug("📊 Calculating analytics for Assignment: {}", assignmentId.getValue());

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        int total = submissions.size();
        int graded = (int) submissions.stream().filter(Submission::isGraded).count();
        int pending = (int) submissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED).count();
        int returned = (int) submissions.stream()
                .filter(s -> s.getStatus() == SubmissionStatus.RETURNED).count();

        BigDecimal avgGrade = submissions.stream()
                .filter(Submission::isGraded)
                .map(s -> s.getGrade().getValue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        avgGrade = avgGrade.divide(
                BigDecimal.valueOf(graded > 0 ? graded : 1),
                2,
                BigDecimal.ROUND_HALF_UP
        );

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        int late = assignment.getDueDate() != null
                ? (int) submissions.stream()
                .filter(s -> s.isLate(assignment.getDueDate())).count()
                : 0;

        int onTime = total - late;

        StatusDistributionDTO statusDist = new StatusDistributionDTO(
                (int) submissions.stream()
                        .filter(s -> s.getStatus() == SubmissionStatus.DRAFT).count(),
                (int) submissions.stream()
                        .filter(s -> s.getStatus() == SubmissionStatus.SUBMITTED).count(),
                (int) submissions.stream()
                        .filter(s -> s.getStatus() == SubmissionStatus.GRADED).count(),
                (int) submissions.stream()
                        .filter(s -> s.getStatus() == SubmissionStatus.RETURNED).count()
        );

        log.info("✅ Analytics for Assignment {}: Total={}, Graded={}, AvgGrade={}",
                assignmentId.getValue(), total, graded, avgGrade);

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
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public boolean hasStudentSubmitted(AssignmentId assignmentId, UserId studentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentAndStudent(
                assignmentId, studentId);
        return !submissions.isEmpty();
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

    private Submission findSubmissionByIdOrThrow(SubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> {
                    log.warn("❌ Submission not found: {}", submissionId.getValue());
                    return new SubmissionNotFoundException(
                            "Submission not found: " + submissionId.getValue());
                });
    }

    // NEW: Basic DTO mapping with only essential information
    private SubmissionDTO mapToBasicSubmissionDTO(Submission submission) {
        GradeDTO gradeDTO = submission.getGrade() != null
                ? new GradeDTO(
                submission.getGrade().getValue().toString(),
                submission.getGrade().getMaxScore().toString(),
                submission.getGrade().getPercentage().toString()
        )
                : null;

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElse(null);

        boolean isLate = assignment != null && assignment.getDueDate() != null
                ? submission.isLate(assignment.getDueDate())
                : false;

        return new SubmissionDTO(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                assignment != null ? assignment.getTitle() : "Unknown Assignment",
                submission.getStudentId().getValue(),
                "Student Name", // TODO: Get from UserQueryPort
                submission.getContent(),
                submission.getStatus().name(),
                gradeDTO,
                submission.getTeacherFeedback(),
                submission.getSubmittedAt().toString(),
                isLate,
                List.of(), // No attachments in basic DTO
                null, // No AI analysis in basic DTO
                submission.getTeamId() != null ? submission.getTeamId().getValue() : null,
                null, // No team name in basic DTO
                submission.getTeamId() != null
        );
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
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElse(null);

        boolean isLate = assignment != null && assignment.getDueDate() != null
                ? submission.isLate(assignment.getDueDate())
                : false;

        boolean isTeamSubmission = submission.getTeamId() != null;
        String teamId = isTeamSubmission ? submission.getTeamId().getValue() : null;
        String teamName = null;

        if (isTeamSubmission) {
            teamName = studentGroupRepository.findById(submission.getTeamId())
                    .map(group -> group.getName())
                    .orElse("Unknown Team");
            log.debug("📊 Mapping team submission - Team ID: {}, Team Name: {}", teamId, teamName);
        }

        return new SubmissionDTO(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                assignment != null ? assignment.getTitle() : "Unknown Assignment",
                submission.getStudentId().getValue(),
                "Student Name", // TODO: Get from UserQueryPort
                submission.getContent(),
                submission.getStatus().name(),
                gradeDTO,
                submission.getTeacherFeedback(),
                submission.getSubmittedAt().toString(),
                isLate,
                attachmentDTOs,
                null, // TODO: Get AI analysis if available
                teamId,
                teamName,
                isTeamSubmission
        );
    }

    // Add this method for basic DTO mapping
    private SubmissionBasicDTO mapToBasicDTO(Submission submission) {
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElse(null);

        // Get student name from user service
        String studentName = "Student Name"; // TODO: Get from UserService
        // MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(submission.getStudentId());
        // String studentName = studentInfo != null ? studentInfo.fullName() : "Unknown Student";

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
    }


}