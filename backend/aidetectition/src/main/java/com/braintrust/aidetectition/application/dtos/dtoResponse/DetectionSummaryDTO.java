package com.braintrust.aidetectition.application.dtos.dtoResponse;

// 📍 aidetection/application/dtos/DetectionSummaryDTO.java
public record DetectionSummaryDTO(
        String submissionId,
        String studentName,
        String assignmentTitle,
        String courseName,
        String probability,
        boolean isLikelyAI,
        String analyzedAt
) {}
