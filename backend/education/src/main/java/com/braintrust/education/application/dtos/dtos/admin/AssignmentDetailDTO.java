package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record AssignmentDetailDTO(
        String assignmentId,
        String title,
        String courseId,
        String courseName,
        BigDecimal aiProbability,
        String analysisStatus,
        String dueDate
) {}