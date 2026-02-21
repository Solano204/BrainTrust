package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.GradebookJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class GradebookEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(GradebookEntityMapper.class);

    private final ObjectMapper objectMapper;

    public GradebookEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GradebookJpaEntity toEntity(Gradebook gradebook) {
        log.debug("Mapping Gradebook Domain {} to JPA Entity", gradebook.getId().getValue());


        String unitGradesJson = serializeUnitGradesMap(gradebook.getUnitGrades());


        String finalFeedbackToStore = unitGradesJson != null ? unitGradesJson : gradebook.getFinalFeedback();

        return new GradebookJpaEntity(
                gradebook.getId().getValue(),
                gradebook.getCourseId().getValue(),
                gradebook.getStudentId().getValue(),
                gradebook.getCalculatedTotal(),
                gradebook.getFinalGrade(),
                finalFeedbackToStore,
                gradebook.getLastCalculated()
        );
    }

    public Gradebook toDomain(GradebookJpaEntity entity) {
        log.debug("Mapping Gradebook JPA Entity {} to Domain", entity.getId());

        GradebookId id = GradebookId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        Map<UnitId, Grade> unitGrades = tryDeserializeUnitGrades(entity.getFinalFeedback());

        String actualFeedback = extractTextFeedback(entity.getFinalFeedback(), unitGrades);

        return Gradebook.reconstitute(
                id,
                courseId,
                studentId,
                entity.getCalculatedTotalValue(),
                entity.getFinalGradeValue(),
                actualFeedback,
                unitGrades,
                entity.getLastCalculated()
        );
    }


    private Map<UnitId, Grade> tryDeserializeUnitGrades(String finalFeedback) {
        if (finalFeedback == null || finalFeedback.trim().isEmpty()) {
            return new HashMap<>();
        }

        if (!isLikelyJson(finalFeedback)) {
            log.debug("FinalFeedback does not appear to be JSON, treating as text feedback");
            return new HashMap<>();
        }

        try {
            Map<String, Map<String, BigDecimal>> serializedMap = objectMapper.readValue(
                    finalFeedback, new TypeReference<Map<String, Map<String, BigDecimal>>>() {});

            return serializedMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> UnitId.fromString(e.getKey()),
                            e -> new Grade(e.getValue().get("value"), e.getValue().get("maxScore"))
                    ));
        } catch (JsonProcessingException e) {
            log.debug("Failed to deserialize unit grades map - content is likely text feedback: {}",
                    finalFeedback.substring(0, Math.min(50, finalFeedback.length())));
            return new HashMap<>();
        }
    }

    private String extractTextFeedback(String finalFeedback, Map<UnitId, Grade> unitGrades) {
        if (finalFeedback == null || finalFeedback.trim().isEmpty()) {
            return null;
        }

        if (!unitGrades.isEmpty()) {
            return null;
        }

        return finalFeedback;
    }

    private boolean isLikelyJson(String str) {
        if (str == null) return false;
        String trimmed = str.trim();
        return trimmed.startsWith("{") && trimmed.endsWith("}");
    }

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
}