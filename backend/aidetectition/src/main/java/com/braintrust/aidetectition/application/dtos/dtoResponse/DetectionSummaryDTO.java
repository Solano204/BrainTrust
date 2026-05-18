package com.braintrust.aidetectition.application.dtos.dtoResponse;

public record DetectionSummaryDTO(
        String submissionId,
        String studentName,
        String assignmentTitle,
        String courseName,
        String probability,
        boolean isLikelyAI,
        String analyzedAt
) {}
