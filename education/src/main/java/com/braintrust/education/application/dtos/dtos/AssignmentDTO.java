package com.braintrust.education.application.dtos.dtos;

import java.util.List;

// 📍 education/application/dtos/AssignmentDTO.java
public record AssignmentDTO(
        String id,
        String courseId,
        String courseName,
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
        List<DocumentDTO> attachments
) {}