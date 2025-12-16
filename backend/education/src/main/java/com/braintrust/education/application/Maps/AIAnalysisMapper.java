package com.braintrust.education.application.Maps;

import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import org.springframework.stereotype.Component;

@Component
public class AIAnalysisMapper {

    /**
     * Convert from Aidetection package AnalysisResultDTO to Education package AIDetectionResultDTO
     */
    public com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO toEducationDTO(AnalysisResultDTO analysisResult) {
        if (analysisResult == null) {
            return null;
        }

        return new com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO(
                analysisResult.id(),
                analysisResult.submissionId(),
                analysisResult.probability(),    // Check actual field name
                analysisResult.percentage(),     // Check actual field name
                analysisResult.modelUsed(),
                analysisResult.confidenceLevel(),
                analysisResult.isLikelyAI(),         // Check actual field name
                analysisResult.isUncertain(),        // Check actual field name
                analysisResult.isLikelyHuman(),      // Check actual field name
                analysisResult.status(),
                analysisResult.analyzedAt() != null ? analysisResult.analyzedAt().toString() : null,
                analysisResult.errorMessage(),
                analysisResult.detectedSegments(),
                analysisResult.metadata()
        );
    }

    /**
     * Alternative: Convert from Aidetection package AIDetectionResultDTO to Education package AIDetectionResultDTO
     */
    public com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO toEducationDTO(AIDetectionResultDTO aidetectionDTO) {
        if (aidetectionDTO == null) {
            return null;
        }

        return new com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO(
                aidetectionDTO.analysisId(),
                aidetectionDTO.submissionId(),
                aidetectionDTO.aiProbability(),
                aidetectionDTO.aiPercentage(),
                aidetectionDTO.modelUsed(),
                aidetectionDTO.confidenceLevel(),
                aidetectionDTO.likelyAI(),
                aidetectionDTO.uncertain(),
                aidetectionDTO.likelyHuman(),
                aidetectionDTO.status(),
                aidetectionDTO.analyzedAt() != null ? aidetectionDTO.analyzedAt().toString() : null,
                aidetectionDTO.errorMessage(),
                aidetectionDTO.detectedSegments(),
                aidetectionDTO.metadata()
        );
    }
}