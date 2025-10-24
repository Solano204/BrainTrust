package com.braintrust.aidetectition.application.dtos.dtos;

import java.time.LocalDateTime;
import java.util.Map;

public record AnalysisResultDTO(
        String id,
        String submissionId,
        String probability,     // BigDecimal as String (0.0 - 1.0)
        String percentage,      // e.g., "87.50%"
        String modelUsed,       // GPT_DETECTOR, BERT_CLASSIFIER, ENSEMBLE
        String confidenceLevel, // HIGH, MEDIUM, LOW
        boolean isLikelyAI,
        boolean isUncertain,
        boolean isLikelyHuman,
        String status,          // PENDING, COMPLETED, FAILED
        LocalDateTime analyzedAt,
        String errorMessage,
        Map<String, Object> metadata
) {}