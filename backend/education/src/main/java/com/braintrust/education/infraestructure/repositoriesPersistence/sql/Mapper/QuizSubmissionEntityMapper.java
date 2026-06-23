package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizSubmissionJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class QuizSubmissionEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(QuizSubmissionEntityMapper.class);
    private final ObjectMapper objectMapper;

    public QuizSubmissionEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public QuizSubmissionJpaEntity toEntity(QuizSubmission submission) {
        log.debug("Mapping QuizSubmission Domain {} to JPA Entity", submission.getId().getValue());

        String answersJson       = null;
        String questionGradesJson = null;

        try {
            if (submission.getAnswers() != null && !submission.getAnswers().isEmpty()) {
                List<Map<String, Object>> answerMaps = submission.getAnswers().stream()
                        .map(this::mapAnswerToJson)
                        .collect(Collectors.toList());
                answersJson = objectMapper.writeValueAsString(answerMaps);
            }

            if (submission.getQuestionGradesMap() != null && !submission.getQuestionGradesMap().isEmpty()) {
                List<Map<String, Object>> gradeMaps = submission.getQuestionGradesMap().entrySet().stream()
                        .map(entry -> {
                            Map<String, Object> map = new HashMap<>();
                            map.put("questionId",   entry.getKey().getValue());
                            QuestionGrade grade = entry.getValue();
                            map.put("earnedPoints", grade.getEarnedPoints());
                            map.put("maxPoints",    grade.getMaxPoints());
                            map.put("feedback",     grade.getFeedback());
                            map.put("autoGraded",   grade.isAutoGraded());
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
                submission.getGrade() != null ? submission.getGrade().getValue()    : null,
                submission.getGrade() != null ? submission.getGrade().getMaxScore() : null,
                submission.getFinalGrade(),
                submission.isCanViewResults(),
                submission.isAutoGraded(),
                questionGradesJson
        );
    }

    public QuizSubmission toDomain(QuizSubmissionJpaEntity entity) {
        log.debug("Mapping QuizSubmission JPA Entity {} to Domain", entity.getId());

        QuizSubmissionId id = QuizSubmissionId.fromString(entity.getId());
        QuizId   quizId    = QuizId.fromString(entity.getQuizId());
        UserId   studentId = UserId.fromString(entity.getStudentId());

        List<QuizAnswer> answers = new ArrayList<>();
        if (entity.getAnswersJson() != null && !entity.getAnswersJson().isEmpty()) {
            try {
                List<Map<String, Object>> answerMaps = objectMapper.readValue(
                        entity.getAnswersJson(), new TypeReference<List<Map<String, Object>>>() {});
                answers = answerMaps.stream().map(this::mapJsonToAnswer).collect(Collectors.toList());
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize quiz answers", e);
                throw new RuntimeException("Failed to deserialize quiz answers", e);
            }
        }

        Map<QuizQuestionId, QuestionGrade> questionGrades = new HashMap<>();
        if (entity.getQuestionGradesJson() != null && !entity.getQuestionGradesJson().isEmpty()) {
            try {
                List<Map<String, Object>> gradeMaps = objectMapper.readValue(
                        entity.getQuestionGradesJson(), new TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> gradeMap : gradeMaps) {
                    QuizQuestionId questionId = QuizQuestionId.fromString((String) gradeMap.get("questionId"));
                    questionGrades.put(questionId, new QuestionGrade(
                            questionId,
                            (Integer) gradeMap.get("earnedPoints"),
                            (Integer) gradeMap.get("maxPoints"),
                            (String)  gradeMap.get("feedback"),
                            (Boolean) gradeMap.get("autoGraded")
                    ));
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to deserialize question grades", e);
                throw new RuntimeException("Failed to deserialize question grades", e);
            }
        }

        Grade grade = null;
        if (entity.getGradeValue() != null && entity.getGradeMaxScore() != null) {
            grade = new Grade(entity.getGradeValue(), entity.getGradeMaxScore());
        }

        return QuizSubmission.reconstitute(
                id, quizId, studentId,
                entity.getAttemptNumber(),
                entity.getStartedAt(),
                entity.getSubmittedAt(),
                QuizSubmissionStatus.valueOf(entity.getStatus()),
                answers,
                grade,
                entity.getFinalGrade(),
                entity.isCanViewResults(),
                entity.isAutoGraded(),
                questionGrades
        );
    }

    private Map<String, Object> mapAnswerToJson(QuizAnswer answer) {
        Map<String, Object> map = new HashMap<>();
        map.put("questionId",      answer.getQuestionId().getValue());
        map.put("selectedOptions", answer.getSelectedOptions());
        map.put("textAnswer",      answer.getTextAnswer());
        return map;
    }

    private QuizAnswer mapJsonToAnswer(Map<String, Object> map) {
        QuizQuestionId questionId = QuizQuestionId.fromString((String) map.get("questionId"));
        @SuppressWarnings("unchecked")
        List<Integer> selectedOptions = (List<Integer>) map.get("selectedOptions");
        return new QuizAnswer(questionId, selectedOptions, (String) map.get("textAnswer"));
    }
}