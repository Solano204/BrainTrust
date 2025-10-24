package com.braintrust.aidetectition.application.dtos.dtos;

// 📍 aidetection/application/dtos/ConfidenceDistributionDTO.java
public record ConfidenceDistributionDTO(
        int high,    // > 70%
        int medium,  // 30-70%
        int low      // < 30%
) {}