package com.braintrust.education.application.Maps;

import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import org.springframework.stereotype.Component;

@Component
public class AIAnalysisMapper {

    public com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO toEducationDTO(AnalysisResultDTO analysisResult) {
        if (analysisResult == null) {
            return null;
        }

        return new com.braintrust.education.application.dtos.dtos.AIDetectionResultDTO(
                analysisResult.id(),
                analysisResult.submissionId(),
                analysisResult.probability(),
                analysisResult.percentage(),
                analysisResult.modelUsed(),
                analysisResult.confidenceLevel(),
                analysisResult.isLikelyAI(),
                analysisResult.isUncertain(),
                analysisResult.isLikelyHuman(),
                analysisResult.status(),
                analysisResult.analyzedAt() != null ? analysisResult.analyzedAt().toString() : null,
                analysisResult.errorMessage(),
                analysisResult.detectedSegments(),
                analysisResult.metadata()
        );
    }

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