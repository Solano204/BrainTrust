package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record AssignmentDTO(
        String id,
        String courseId,
        String unitId,
        String courseName,
        String unitName,
        String title,
        String description,
        String createdAt,
        String dueDate,
        int maxPoints,
        String instructions,
        boolean active,
        int submissionCount,
        int attachmentCount,
        boolean canAcceptSubmissions,
        String targetType,
        boolean isTeamAssignment,
        String submissionFormat, // ✅ NEW: Submission format
        List<DocumentDTO> attachments,
        List<String> links
) {}