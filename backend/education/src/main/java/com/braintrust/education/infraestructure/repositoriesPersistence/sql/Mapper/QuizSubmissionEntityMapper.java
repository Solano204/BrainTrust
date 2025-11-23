package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;


import com.braintrust.education.domain.model.QuizAnswer;
import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizSubmissionJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
// other imports...

@Component
public class QuizSubmissionEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(QuizSubmissionEntityMapper.class);

    private final ObjectMapper objectMapper;

    public QuizSubmissionEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public QuizSubmissionJpaEntity toEntity(QuizSubmission submission) {
        log.debug("Mapping QuizSubmission Domain {} to JPA Entity", submission.getId().getValue());

        String answersJson = null;
        try {
            if (submission.getAnswers() != null && !submission.getAnswers().isEmpty()) {
                List<Map<String, Object>> answerMaps = submission.getAnswers().stream()
                        .map(this::mapAnswerToJson)
                        .collect(Collectors.toList());
                answersJson = objectMapper.writeValueAsString(answerMaps);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize quiz answers", e);
            throw new RuntimeException("Failed to serialize quiz answers", e);
        }

        return new QuizSubmissionJpaEntity(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                submission.getStudentId().getValue(),
                submission.getAttemptNumber(),
                submission.getStartedAt(),
                submission.getSubmittedAt(),
                submission.getStatus().name(),
                answersJson,
                submission.getGrade() != null ? submission.getGrade().getValue() : null,
                submission.getGrade() != null ? submission.getGrade().getMaxScore() : null,
                submission.isAutoGraded()
        );
    }

    public QuizSubmission toDomain(QuizSubmissionJpaEntity entity) {
        log.debug("Mapping QuizSubmission JPA Entity {} to Domain", entity.getId());

        QuizSubmissionId id = QuizSubmissionId.fromString(entity.getId());
        QuizId quizId = QuizId.fromString(entity.getQuizId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        // Deserialize answers
        List<QuizAnswer> answers = new ArrayList<>();
        if (entity.getAnswersJson() != null && !entity.getAnswersJson().isEmpty()) {
            try {
                List<Map<String, Object>> answerMaps = objectMapper.readValue(
                        entity.getAnswersJson(), new TypeReference<List<Map<String, Object>>>() {});

                answers = answerMaps.stream()
                        .map(this::mapJsonToAnswer)
                        .collect(Collectors.toList());
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize quiz answers", e);
                throw new RuntimeException("Failed to deserialize quiz answers", e);
            }
        }

        // Create grade if exists
        Grade grade = null;
        if (entity.getGradeValue() != null && entity.getGradeMaxScore() != null) {
            grade = new Grade(entity.getGradeValue(), entity.getGradeMaxScore());
        }

        return QuizSubmission.reconstitute(
                id,
                quizId,
                studentId,
                entity.getAttemptNumber(),
                entity.getStartedAt(),
                entity.getSubmittedAt(),
                QuizSubmissionStatus.valueOf(entity.getStatus()),
                answers,
                grade,
                entity.isAutoGraded()
        );
    }

    private Map<String, Object> mapAnswerToJson(QuizAnswer answer) {
        Map<String, Object> map = new HashMap<>();
        map.put("questionId", answer.getQuestionId().getValue());
        map.put("selectedOptions", answer.getSelectedOptions());
        map.put("textAnswer", answer.getTextAnswer());
        return map;
    }

    private QuizAnswer mapJsonToAnswer(Map<String, Object> map) {
        QuizQuestionId questionId = QuizQuestionId.fromString((String) map.get("questionId"));

        @SuppressWarnings("unchecked")
        List<Integer> selectedOptions = (List<Integer>) map.get("selectedOptions");

        String textAnswer = (String) map.get("textAnswer");

        return new QuizAnswer(questionId, selectedOptions, textAnswer);
    }
}