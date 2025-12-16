package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.UnitGrade;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.UnitGradeJpaEntity;
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
public class UnitGradeEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(UnitGradeEntityMapper.class);

    private final ObjectMapper objectMapper;

    public UnitGradeEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public UnitGradeJpaEntity toEntity(UnitGrade unitGrade) {
        log.debug("Mapping UnitGrade Domain {} to JPA Entity", unitGrade.getId().getValue());

        // Serialize grades maps to JSON
        String assignmentGradesJson = serializeGradesMap(unitGrade.getAssignmentGrades());
        String quizGradesJson = serializeGradesMap(unitGrade.getQuizGrades());

        return new UnitGradeJpaEntity(
                unitGrade.getId().getValue(),
                unitGrade.getUnitId().getValue(),
                unitGrade.getStudentId().getValue(),
                unitGrade.getCalculatedTotal(),  // calculatedTotalValue in JPA
                unitGrade.getFinalGrade(),       // finalGradeValue in JPA
                unitGrade.getFinalFeedback(),    // finalFeedback in JPA
                assignmentGradesJson,
                quizGradesJson,
                unitGrade.getLastCalculated()
        );
    }

    public UnitGrade toDomain(UnitGradeJpaEntity entity) {
        log.debug("Mapping UnitGrade JPA Entity {} to Domain", entity.getId());

        UnitGradeId id = UnitGradeId.fromString(entity.getId());
        UnitId unitId = UnitId.fromString(entity.getUnitId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        // Deserialize grades maps from JSON
        Map<AssignmentId, Grade> assignmentGrades = deserializeGradesMap(
                entity.getAssignmentGradesJson(), AssignmentId::fromString);
        Map<QuizId, Grade> quizGrades = deserializeGradesMap(
                entity.getQuizGradesJson(), QuizId::fromString);

        return UnitGrade.reconstitute(
                id,
                unitId,
                studentId,
                entity.getCalculatedTotalValue(),  // calculatedTotal in domain
                entity.getFinalGradeValue(),       // finalGrade in domain
                entity.getFinalFeedback(),         // finalFeedback in domain
                assignmentGrades,
                quizGrades,
                entity.getLastCalculated()
        );
    }

    private <K> String serializeGradesMap(Map<K, Grade> gradesMap) {
        if (gradesMap == null || gradesMap.isEmpty()) {
            return null;
        }

        try {
            Map<String, Map<String, BigDecimal>> serializedMap = gradesMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            e -> {
                                Object key = e.getKey();
                                // Handle different types of keys that have getValue() method
                                if (key instanceof AssignmentId) {
                                    return ((AssignmentId) key).getValue();
                                } else if (key instanceof QuizId) {
                                    return ((QuizId) key).getValue();
                                } else if (key instanceof UnitId) {
                                    return ((UnitId) key).getValue();
                                } else if (key instanceof String) {
                                    return (String) key;
                                } else {
                                    // Use reflection or toString() as fallback
                                    try {
                                        java.lang.reflect.Method getValueMethod = key.getClass().getMethod("getValue");
                                        return (String) getValueMethod.invoke(key);
                                    } catch (Exception ex) {
                                        return key.toString();
                                    }
                                }
                            },
                            e -> Map.of(
                                    "value", e.getValue().getValue(),
                                    "maxScore", e.getValue().getMaxScore()
                            )
                    ));
            return objectMapper.writeValueAsString(serializedMap);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize grades map", e);
            throw new RuntimeException("Failed to serialize grades map", e);
        }
    }

    private <T> Map<T, Grade> deserializeGradesMap(String json, java.util.function.Function<String, T> keyMapper) {
        if (json == null || json.trim().isEmpty()) {
            return new HashMap<>();
        }

        try {
            Map<String, Object> rawMap = objectMapper.readValue(
                    json, new TypeReference<Map<String, Object>>() {});

            Map<T, Grade> result = new HashMap<>();

            for (Map.Entry<String, Object> entry : rawMap.entrySet()) {
                try {
                    T key = keyMapper.apply(entry.getKey());
                    Object value = entry.getValue();

                    Grade grade;
                    if (value instanceof Map) {
                        // Case 1: Nested object format {"value": 85, "maxScore": 100}
                        @SuppressWarnings("unchecked")
                        Map<String, Object> nestedMap = (Map<String, Object>) value;
                        BigDecimal gradeValue = toBigDecimal(nestedMap.get("value"));
                        BigDecimal maxScore = toBigDecimal(nestedMap.get("maxScore"));

                        if (gradeValue == null) {
                            log.warn("Missing 'value' in grade for key: {}", entry.getKey());
                            continue;
                        }

                        // Provide default maxScore if null
                        if (maxScore == null) {
                            maxScore = BigDecimal.valueOf(100);
                            log.debug("Using default maxScore of 100 for key: {}", entry.getKey());
                        }

                        grade = new Grade(gradeValue, maxScore);
                    } else {
                        // Case 2: Direct value format (just a number)
                        // Use the value directly and use default maxScore of 100
                        BigDecimal gradeValue = toBigDecimal(value);
                        if (gradeValue == null) {
                            log.warn("Invalid grade value for key: {}", entry.getKey());
                            continue;
                        }

                        log.debug("Found old format grade for key: {}. Converting to new format with default maxScore.", entry.getKey());
                        grade = new Grade(gradeValue, BigDecimal.valueOf(100));
                    }

                    result.put(key, grade);
                } catch (Exception e) {
                    log.warn("Failed to parse grade for key: {}", entry.getKey(), e);
                    // Continue processing other entries
                }
            }

            return result;
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize grades map. JSON: {}", json, e);
            throw new RuntimeException("Failed to deserialize grades map", e);
        }
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj == null) {
            return null;
        }
        if (obj instanceof BigDecimal) {
            return (BigDecimal) obj;
        }
        if (obj instanceof Number) {
            return BigDecimal.valueOf(((Number) obj).doubleValue());
        }
        if (obj instanceof String) {
            try {
                return new BigDecimal((String) obj);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}