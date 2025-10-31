package com.braintrust.aidetectition.application.dtos.dtosResponse;

// 📍 aidetection/application/dtos/ModelPerformanceDTO.java
public record ModelPerformanceDTO(
        String modelType,
        String version,
        String accuracy,
        String precision,
        String recall,
        String f1Score,
        boolean isAvailable
) {}