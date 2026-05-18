package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record TeamAssignmentDTO(
        String id,
        String courseId,
        String courseName,
        String groupId,
        String groupName,
        String title,
        String description,
        String createdAt,
        List<DocumentDTO> attachments,
        String dueDate,
        int maxPoints,
        String instructions,
        boolean active,
        int submissionCount,
        boolean teamGradeApplied,
        List<String> teamMemberIds
) {}