package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AnalysisEntityMapper {

    private final ObjectMapper objectMapper;

    // ✅ Spring will automatically inject ObjectMapper bean
    public AnalysisEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AnalysisRequestJpaEntity toEntity(AnalysisRequest analysis) throws JsonProcessingException {
        String detectedSegmentsJson = null;
        BigDecimal probability = null;
        String modelUsed = null;
        String confidenceLevel = null;

        if (analysis.getResult() != null) {
            DetectionResult result = analysis.getResult();
            probability = result.getProbability().getValue();
            modelUsed = result.getModelUsed().name();
            confidenceLevel = result.getConfidenceLevel();

            // ✅ Serialize detected segments to JSON
            if (!result.getDetectedSegments().isEmpty()) {
                List<Map<String, Object>> segmentMaps = result.getDetectedSegments().stream()
                        .map(segment -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("text", segment.getText());
                            map.put("startIndex", segment.getStartIndex());
                            map.put("endIndex", segment.getEndIndex());
                            map.put("aiProbability", segment.getAiProbability().toString());
                            map.put("reason", segment.getReason());
                            return map;
                        })
                        .toList();
                detectedSegmentsJson = objectMapper.writeValueAsString(segmentMaps);
            }
        }

        return new AnalysisRequestJpaEntity(
                analysis.getId().getValue(),
                analysis.getSubmissionId().getValue(),
                analysis.getContentToAnalyze(),
                analysis.getStatus().name(),
                probability,
                modelUsed,
                confidenceLevel,
                detectedSegmentsJson,
                analysis.getErrorMessage(),
                analysis.getCreatedAt(),
                analysis.getAnalyzedAt()
        );
    }

    public AnalysisRequest toDomain(AnalysisRequestJpaEntity entity) {
        AnalysisId analysisId = AnalysisId.fromString(entity.getId());
        SubmissionId submissionId = SubmissionId.fromString(entity.getSubmissionId());
        AnalysisStatus status = AnalysisStatus.valueOf(entity.getStatus());

        DetectionResult result = null;
        if (entity.getProbability() != null && entity.getModelUsed() != null) {
            // ✅ Deserialize detected segments from JSON
            List<DetectedSegment> detectedSegments = new ArrayList<>();
            if (entity.getDetectedSegmentsJson() != null && !entity.getDetectedSegmentsJson().isEmpty()) {
                try {
                    List<Map<String, Object>> segmentMaps = objectMapper.readValue(
                            entity.getDetectedSegmentsJson(),
                            new TypeReference<List<Map<String, Object>>>() {}
                    );
                    detectedSegments = segmentMaps.stream()
                            .map(map -> new DetectedSegment(
                                    (String) map.get("text"),
                                    (Integer) map.get("startIndex"),
                                    (Integer) map.get("endIndex"),
                                    new BigDecimal((String) map.get("aiProbability")),
                                    (String) map.get("reason")
                            ))
                            .toList();
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to deserialize detected segments", e);
                }
            }

            AIProbability probability = new AIProbability(entity.getProbability());
            ModelType modelType = ModelType.valueOf(entity.getModelUsed());

            result = new DetectionResult(
                    probability,
                    modelType,
                    entity.getContentToAnalyze(),
                    detectedSegments,
                    Map.of()
            );
        }

        return AnalysisRequest.reconstitute(
                analysisId,
                submissionId,
                entity.getContentToAnalyze(),
                status,
                result,
                entity.getErrorMessage(),
                entity.getCreatedAt(),
                entity.getAnalyzedAt()
        );
    }
}