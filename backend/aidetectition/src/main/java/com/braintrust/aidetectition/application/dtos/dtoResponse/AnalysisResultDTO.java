package com.braintrust.aidetectition.application.dtos.dtoResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AnalysisResultDTO(
        String id,
        String submissionId,
        String probability,
        String percentage,
        String modelUsed,
        String confidenceLevel,
        boolean isLikelyAI,
        boolean isUncertain,
        boolean isLikelyHuman,
        String status,
        LocalDateTime analyzedAt,
        String errorMessage,
        List<DetectedSegmentDTO> detectedSegments, // ✅ NEW
        Map<String, Object> metadata
) {}