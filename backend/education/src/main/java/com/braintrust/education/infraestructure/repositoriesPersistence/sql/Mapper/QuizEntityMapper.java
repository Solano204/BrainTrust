package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class QuizEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(QuizEntityMapper.class);
    private final ObjectMapper objectMapper;

    public QuizEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public QuizJpaEntity toEntity(Quiz quiz) {
        log.debug("Mapping Quiz Domain {} to JPA Entity", quiz.getId().getValue());

        QuizJpaEntity entity = new QuizJpaEntity(
                quiz.getId().getValue(),
                quiz.getCourseId().getValue(),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getAvailableFrom(),
                quiz.getAvailableUntil(),
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.isShuffleQuestions(),
                quiz.isShowCorrectAnswers(),
                quiz.getCreatedAt(),
                quiz.isActive()
        );

        // ✅ FIXED: Map questions with bidirectional relationship
        if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            List<QuizQuestionJpaEntity> questionEntities = quiz.getQuestions().stream()
                    .map(question -> toQuestionEntity(question, entity)) // Pass parent entity
                    .collect(Collectors.toList());
            entity.setQuestions(questionEntities);
        }

        return entity;
    }

    private QuizQuestionJpaEntity toQuestionEntity(QuizQuestion question, QuizJpaEntity parentQuiz) {
        String optionsJson = null;
        try {
            if (question.getOptions() != null && !question.getOptions().isEmpty()) {
                List<Map<String, Object>> optionMaps = question.getOptions().stream()
                        .map(opt -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("text", opt.getText());
                            map.put("correct", opt.isCorrect());
                            return map;
                        })
                        .collect(Collectors.toList());
                optionsJson = objectMapper.writeValueAsString(optionMaps);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize quiz question options", e);
            throw new RuntimeException("Failed to serialize question options", e);
        }

        QuizQuestionJpaEntity entity = new QuizQuestionJpaEntity(
                question.getId().getValue(),
                question.getQuestionText(),
                question.getType().name(),
                question.getPoints(),
                optionsJson,
                question.getCorrectAnswer()
        );

        // ✅ Set the bidirectional relationship
        entity.setQuiz(parentQuiz);
        return entity;
    }

    public Quiz toDomain(QuizJpaEntity entity) {
        log.debug("Mapping Quiz JPA Entity {} to Domain", entity.getId());

        QuizId id = QuizId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UnitId unitId = entity.getUnitId() != null ? UnitId.fromString(entity.getUnitId()) : null;

        List<QuizQuestion> questions = new ArrayList<>();
        if (entity.getQuestions() != null) {
            questions = entity.getQuestions().stream()
                    .map(this::toDomainQuestion)
                    .collect(Collectors.toList());
        }

        return Quiz.reconstitute(
                id,
                courseId,
                unitId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getAvailableFrom(),
                entity.getAvailableUntil(),
                entity.getTimeLimitMinutes(),
                entity.getMaxAttempts(),
                entity.isShuffleQuestions(),
                entity.isShowCorrectAnswers(),
                entity.getCreatedAt(),
                questions,
                entity.isActive()
        );
    }

    private QuizQuestion toDomainQuestion(QuizQuestionJpaEntity entity) {
        QuizQuestionId id = QuizQuestionId.fromString(entity.getId());
        QuestionType type = QuestionType.valueOf(entity.getQuestionType());

        List<QuestionOption> options = new ArrayList<>();
        if (entity.getOptionsJson() != null && !entity.getOptionsJson().isEmpty()) {
            try {
                List<Map<String, Object>> optionMaps = objectMapper.readValue(
                        entity.getOptionsJson(),
                        new TypeReference<List<Map<String, Object>>>() {}
                );
                options = optionMaps.stream()
                        .map(map -> new QuestionOption(
                                (String) map.get("text"),
                                (Boolean) map.get("correct")
                        ))
                        .collect(Collectors.toList());
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize quiz question options", e);
                throw new RuntimeException("Failed to deserialize question options", e);
            }
        }

        return QuizQuestion.reconstitute(
                id,
                entity.getQuestionText(),
                type,
                entity.getPoints(),
                options,
                entity.getCorrectAnswer()
        );
    }

    public Quiz mapToBasicQuiz(QuizJpaEntity entity) {
        QuizId id = QuizId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UnitId unitId = entity.getUnitId() != null ? UnitId.fromString(entity.getUnitId()) : null;

        return Quiz.reconstitute(
                id,
                courseId,
                unitId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getAvailableFrom(),
                entity.getAvailableUntil(),
                entity.getTimeLimitMinutes(),
                entity.getMaxAttempts(),
                entity.isShuffleQuestions(),
                entity.isShowCorrectAnswers(),
                entity.getCreatedAt(),
                new ArrayList<>(),
                entity.isActive()
        );
    }
}