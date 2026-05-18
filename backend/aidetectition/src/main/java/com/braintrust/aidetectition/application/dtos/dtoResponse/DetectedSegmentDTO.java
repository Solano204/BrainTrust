package com.braintrust.aidetectition.application.dtos.dtoResponse;

public record DetectedSegmentDTO(
        String text,
        int startIndex,
        int endIndex,
        String aiProbability,
        String percentage,
        String reason,
        boolean isHighConfidence
) {}