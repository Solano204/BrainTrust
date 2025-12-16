package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.*;
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
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
        String questionGradesJson = null;

        try {
            // Serialize answers
            if (submission.getAnswers() != null && !submission.getAnswers().isEmpty()) {
                List<Map<String, Object>> answerMaps = submission.getAnswers().stream()
                        .map(this::mapAnswerToJson)
                        .collect(Collectors.toList());
                answersJson = objectMapper.writeValueAsString(answerMaps);
            }

            // ✅ Serialize question grades
            if (submission.getQuestionGradesMap() != null && !submission.getQuestionGradesMap().isEmpty()) {
                List<Map<String, Object>> gradeMaps = submission.getQuestionGradesMap().entrySet().stream()
                        .map(entry -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("questionId", entry.getKey().getValue());
                            QuestionGrade grade = entry.getValue();
                            map.put("earnedPoints", grade.getEarnedPoints());
                            map.put("maxPoints", grade.getMaxPoints());
                            map.put("feedback", grade.getFeedback());
                            map.put("autoGraded", grade.isAutoGraded());
                            return map;
                        })
                        .collect(Collectors.toList());
                questionGradesJson = objectMapper.writeValueAsString(gradeMaps);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize quiz data", e);
            throw new RuntimeException("Failed to serialize quiz data", e);
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
                submission.isAutoGraded(),
                questionGradesJson // ✅ NEW: Include question grades JSON
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

        // ✅ Deserialize question grades
        Map<QuizQuestionId, QuestionGrade> questionGrades = new HashMap<>();
        if (entity.getQuestionGradesJson() != null && !entity.getQuestionGradesJson().isEmpty()) {
            try {
                List<Map<String, Object>> gradeMaps = objectMapper.readValue(
                        entity.getQuestionGradesJson(), new TypeReference<List<Map<String, Object>>>() {});

                for (Map<String, Object> gradeMap : gradeMaps) {
                    QuizQuestionId questionId = QuizQuestionId.fromString((String) gradeMap.get("questionId"));
                    int earnedPoints = (Integer) gradeMap.get("earnedPoints");
                    int maxPoints = (Integer) gradeMap.get("maxPoints");
                    String feedback = (String) gradeMap.get("feedback");
                    boolean autoGraded = (Boolean) gradeMap.get("autoGraded");

                    questionGrades.put(questionId, new QuestionGrade(
                            questionId, earnedPoints, maxPoints, feedback, autoGraded
                    ));
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize question grades", e);
                throw new RuntimeException("Failed to deserialize question grades", e);
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
                entity.isAutoGraded(),
                questionGrades // ✅ Pass question grades to reconstitute
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