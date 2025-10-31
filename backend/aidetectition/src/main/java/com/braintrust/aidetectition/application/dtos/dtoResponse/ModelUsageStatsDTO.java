package com.braintrust.aidetectition.application.dtos.dtosResponse;

// 📍 aidetection/application/dtos/ModelUsageStatsDTO.java
public record ModelUsageStatsDTO(
        int gptDetector,
        int bertClassifier,
        int ensemble
) {}