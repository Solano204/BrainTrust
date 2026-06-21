package com.braintrust.education.application.dtos.dtos;

import com.braintrust.aidetectition.application.dtos.dtoResponse.DetectedSegmentDTO;

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
        String analyzedAt,
        String errorMessage,
        List<DetectedSegmentDTO> detectedSegments,
        Map<String, Object> metadata
) {}