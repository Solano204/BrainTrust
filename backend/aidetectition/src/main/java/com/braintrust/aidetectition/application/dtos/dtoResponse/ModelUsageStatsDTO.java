package com.braintrust.aidetectition.application.dtos.dtoResponse;

public record ModelUsageStatsDTO(
        int gptDetector,
        int bertClassifier,
        int ensemble
) {}