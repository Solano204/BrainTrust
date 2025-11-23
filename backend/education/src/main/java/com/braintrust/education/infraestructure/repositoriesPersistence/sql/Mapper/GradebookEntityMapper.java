package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.GradebookJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
// other imports...

@Component
public class GradebookEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(GradebookEntityMapper.class);

    private final ObjectMapper objectMapper;

    public GradebookEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GradebookJpaEntity toEntity(Gradebook gradebook) {
        log.debug("Mapping Gradebook Domain {} to JPA Entity", gradebook.getId().getValue());

        // Serialize unit grades map to JSON
        String unitGradesJson = serializeUnitGradesMap(gradebook.getUnitGrades());

        return new GradebookJpaEntity(
                gradebook.getId().getValue(),
                gradebook.getCourseId().getValue(),
                gradebook.getStudentId().getValue(),
                gradebook.getCalculatedTotal(),
                gradebook.getFinalGrade(),
                gradebook.getFinalFeedback(),
                gradebook.getLastCalculated()
        );
    }

    public Gradebook toDomain(GradebookJpaEntity entity) {
        log.debug("Mapping Gradebook JPA Entity {} to Domain", entity.getId());

        GradebookId id = GradebookId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        // Deserialize unit grades map from JSON
        Map<UnitId, Grade> unitGrades = deserializeUnitGrades(entity.getFinalFeedback()); // Using finalFeedback field to store serialized unit grades

        return Gradebook.reconstitute(
                id,
                courseId,
                studentId,
                entity.getCalculatedTotalValue(),
                entity.getFinalGradeValue(),
                entity.getFinalFeedback(),
                unitGrades,
                entity.getLastCalculated()
        );
    }

    // Serialize unit grades map to JSON
    private String serializeUnitGradesMap(Map<UnitId, Grade> unitGrades) {
        if (unitGrades == null || unitGrades.isEmpty()) {
            return null;
        }

        try {
            Map<String, Map<String, BigDecimal>> serializedMap = unitGrades.entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> e.getKey().getValue().toString(),
                            e -> Map.of(
                                    "value", e.getValue().getValue(),
                                    "maxScore", e.getValue().getMaxScore()
                            )
                    ));
            return objectMapper.writeValueAsString(serializedMap);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize unit grades map", e);
            throw new RuntimeException("Failed to serialize unit grades map", e);
        }
    }

    // Deserialize unit grades map from JSON
    private Map<UnitId, Grade> deserializeUnitGrades(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new HashMap<>();
        }

        try {
            Map<String, Map<String, BigDecimal>> serializedMap = objectMapper.readValue(
                    json, new TypeReference<Map<String, Map<String, BigDecimal>>>() {});

            return serializedMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> UnitId.fromString(e.getKey()),
                            e -> new Grade(e.getValue().get("value"), e.getValue().get("maxScore"))
                    ));
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize unit grades map", e);
            // If deserialization fails, return empty map (might be regular feedback text)
            return new HashMap<>();
        }
    }
}