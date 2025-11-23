package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record SubmissionDTO(
        String id,
        String assignmentId,
        String assignmentTitle,
        String studentId,
        String studentName,
        String content,
        String status,  // DRAFT, SUBMITTED, GRADED, RETURNED
        GradeDTO grade,
        String teacherFeedback,
        String submittedAt,
        boolean isLate,
        List<DocumentDTO> attachments,
        AIDetectionResultDTO aiAnalysis,
        // ✅ ADD TEAM INFORMATION
        String teamId,           // Team ID if team submission
        String teamName,         // Team name if team submission
        boolean isTeamSubmission // Convenience flag
) {}