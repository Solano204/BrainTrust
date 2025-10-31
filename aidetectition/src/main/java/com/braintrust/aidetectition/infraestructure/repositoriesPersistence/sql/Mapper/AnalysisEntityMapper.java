package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j // ⬅️ Enable the 'log' variable
public class AnalysisEntityMapper {

    private final ObjectMapper objectMapper;

    // ✅ Spring will automatically inject ObjectMapper bean
    public AnalysisEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Converts a Domain AnalysisRequest to a JPA Entity.
     * @throws JsonProcessingException if serialization fails.
     */
    public AnalysisRequestJpaEntity toEntity(AnalysisRequest analysis) throws JsonProcessingException {
        String detectedSegmentsJson = null;
        BigDecimal probability = null;
        String modelUsed = null;
        String confidenceLevel = null;

        log.debug("Mapping Domain AnalysisRequest {} to JPA Entity.", analysis.getId().getValue());

        if (analysis.getResult() != null) {
            DetectionResult result = analysis.getResult();
            probability = result.getProbability().getValue();
            modelUsed = result.getModelUsed().name();
            confidenceLevel = result.getConfidenceLevel();

            // ✅ Serialize detected segments to JSON
            if (!result.getDetectedSegments().isEmpty()) {
                log.trace("Serializing {} detected segments to JSON.", result.getDetectedSegments().size());
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

                try {
                    detectedSegmentsJson = objectMapper.writeValueAsString(segmentMaps);
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize detected segments for Analysis ID {}.", analysis.getId().getValue(), e);
                    throw e; // Re-throw to be handled by service layer transaction
                }
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

    /**
     * Converts a JPA Entity back to a Domain AnalysisRequest.
     */
    public AnalysisRequest toDomain(AnalysisRequestJpaEntity entity) {
        AnalysisId analysisId = AnalysisId.fromString(entity.getId());
        SubmissionId submissionId = SubmissionId.fromString(entity.getSubmissionId());
        AnalysisStatus status = AnalysisStatus.valueOf(entity.getStatus());

        log.debug("Mapping JPA Entity {} back to Domain AnalysisRequest.", analysisId.getValue());

        DetectionResult result = null;
        if (entity.getProbability() != null && entity.getModelUsed() != null) {

            // ✅ Deserialize detected segments from JSON
            List<DetectedSegment> detectedSegments = new ArrayList<>();
            if (entity.getDetectedSegmentsJson() != null && !entity.getDetectedSegmentsJson().isEmpty()) {
                try {
                    log.trace("Deserializing detected segments for Analysis ID: {}", analysisId.getValue());
                    List<Map<String, Object>> segmentMaps = objectMapper.readValue(
                            entity.getDetectedSegmentsJson(),
                            new TypeReference<List<Map<String, Object>>>() {}
                    );
                    detectedSegments = segmentMaps.stream()
                            .map(map -> new DetectedSegment(
                                    (String) map.get("text"),
                                    (Integer) map.get("startIndex"),
                                    (Integer) map.get("endIndex"),
                                    // Note: BigDecimal constructor from String is safer
                                    new BigDecimal((String) map.get("aiProbability")),
                                    (String) map.get("reason")
                            ))
                            .toList();
                } catch (JsonProcessingException | ClassCastException e) {
                    log.error("Failed to deserialize detected segments for Analysis ID {}. Data integrity compromised.", analysisId.getValue(), e);
                    // Crucial: Throw a runtime exception if data integrity is compromised
                    throw new RuntimeException("Failed to deserialize detected segments due to JSON format error.", e);
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