package com.braintrust.aidetectition.application.dtos.dtos;

// 📍 aidetection/application/dtos/ModelUsageStatsDTO.java
public record ModelUsageStatsDTO(
        int gptDetector,
        int bertClassifier,
        int ensemble
) {}