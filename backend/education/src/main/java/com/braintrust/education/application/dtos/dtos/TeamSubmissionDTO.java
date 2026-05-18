package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record TeamSubmissionDTO(
        String id,
        String assignmentId,
        String assignmentTitle,
        String submitterId,
        String submitterName,
        String groupId,
        String groupName,
        String content,
        String status,
        GradeDTO grade,
        String teacherFeedback,
        String submittedAt,
        boolean late,
        List<DocumentDTO> attachments,
        boolean teamGradeApplied,
        List<TeamMemberGradeDTO> memberGrades // Shows how grade was applied
) {}