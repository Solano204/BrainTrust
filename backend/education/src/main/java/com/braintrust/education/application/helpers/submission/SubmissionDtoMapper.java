package com.braintrust.education.application.helpers.submission;

import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.education.application.Maps.AIAnalysisMapper;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SubmissionDtoMapper {

    private static final Logger log = LoggerFactory.getLogger(SubmissionDtoMapper.class);

    private final AssignmentRepository assignmentRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final UserService userService;
    private final AIAnalysisMapper aiAnalysisMapper;

    public SubmissionDtoMapper(
            AssignmentRepository assignmentRepository,
            StudentGroupRepository studentGroupRepository,
            UserService userService,
            AIAnalysisMapper aiAnalysisMapper) {
        this.assignmentRepository = assignmentRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.userService = userService;
        this.aiAnalysisMapper = aiAnalysisMapper;
    }

    public SubmissionDTO toSubmissionDTO(Submission submission, AIDetectionResultDTO aiAnalysis) {
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

            com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO mappedAiAnalysis = null;

            if (aiAnalysis != null) {
                mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(aiAnalysis);
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
                    mappedAiAnalysis,
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
            return toSubmissionDTOFallback(submission, aiAnalysis);
        }
    }

    public SubmissionBasicDTO toBasicDTO(Submission submission) {
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

    private SubmissionDTO toSubmissionDTOFallback(Submission submission, AIDetectionResultDTO aiAnalysis) {
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
            mappedAiAnalysis = aiAnalysisMapper.toEducationDTO(aiAnalysis);
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
                mappedAiAnalysis,
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

    private String getStudentName(UserId studentId) {
        try {
            MinimalUserInfoDTO userInfo = userService.getMinimalUserInfo(studentId);
            return userInfo.fullName();
        } catch (Exception e) {
            log.warn("Failed to get student name for user {}, using fallback", studentId.getValue());
            return "Student Name";
        }
    }

    private String getAssignmentTitle(com.braintrust.education.domain.valueobjects.AssignmentId assignmentId) {
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
}