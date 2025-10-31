package com.braintrust.aidetectition.application.dtos.dtosResponse;

public record DetectedSegmentDTO(
        String text,
        int startIndex,
        int endIndex,
        String aiProbability,
        String percentage,
        String reason,
        boolean isHighConfidence
) {}