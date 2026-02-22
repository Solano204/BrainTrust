package com.braintrust.aidetectition.application.dtos.dtoResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AIDetectionResultDTO(
        String analysisId,
        String submissionId,
        String aiProbability,
        String aiPercentage,
        String modelUsed,
        String confidenceLevel,
        boolean likelyAI,
        boolean uncertain,
        boolean likelyHuman,
        String status,
        LocalDateTime analyzedAt,
        String errorMessage,
        List<DetectedSegmentDTO> detectedSegments,
        Map<String, Object> metadata
) {}