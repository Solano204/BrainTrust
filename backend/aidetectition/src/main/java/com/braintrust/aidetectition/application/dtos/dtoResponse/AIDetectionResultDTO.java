package com.braintrust.aidetectition.application.dtos.dtoResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AIDetectionResultDTO(
        String analysisId,
        String submissionId,
        String aiProbability,  // ✅ Changed from probability
        String aiPercentage,   // ✅ Changed from percentage
        String modelUsed,
        String confidenceLevel,
        boolean likelyAI,      // ✅ Changed from isLikelyAI
        boolean uncertain,     // ✅ Changed from isUncertain
        boolean likelyHuman,   // ✅ Changed from isLikelyHuman
        String status,
        LocalDateTime analyzedAt,
        String errorMessage,
        List<DetectedSegmentDTO> detectedSegments,
        Map<String, Object> metadata
) {}