package com.braintrust.aidetectition.application.dtos.dtoResponse;

import java.time.LocalDateTime;

// 📍 aidetection/application/dtos/AIDetectionResultDTO.java
public record AIDetectionResultDTO(
        String analysisId,
        String probability,
        String percentage,
        boolean isLikelyAI,
        String confidenceLevel,
        String modelUsed,
        LocalDateTime analyzedAt
) {}