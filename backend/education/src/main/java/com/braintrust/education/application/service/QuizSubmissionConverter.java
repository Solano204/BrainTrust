package com.braintrust.education.application.service;


import com.braintrust.education.application.dtos.commands.GradeQuizSubmissionCommand;

import com.braintrust.education.domain.model.QuestionGrade;
import com.braintrust.education.domain.valueobjects.QuizQuestionId;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class QuizSubmissionConverter {

    /**
     * Convert GradeQuizSubmissionCommand to domain QuestionGrade map
     * This keeps the domain layer independent of application layer DTOs
     */
    public Map<QuizQuestionId, QuestionGrade> toQuestionGrades(GradeQuizSubmissionCommand command) {
        if (command.questionGrades() == null || command.questionGrades().isEmpty()) {
            return Map.of();
        }

        Map<QuizQuestionId, QuestionGrade> grades = new HashMap<>();

        for (GradeQuizSubmissionCommand.QuestionGrade dtoGrade : command.questionGrades()) {
            QuizQuestionId questionId = QuizQuestionId.fromString(dtoGrade.questionId());

            QuestionGrade domainGrade = new QuestionGrade(
                    questionId,
                    dtoGrade.earnedPoints(),
                    dtoGrade.maxPoints(),
                    dtoGrade.feedback(),
                    false // Teacher graded, not auto-graded
            );

            grades.put(questionId, domainGrade);
        }

        return grades;
    }

    /**
     * Calculate totals from question grades to verify consistency
     */
    public TotalPoints calculateTotals(Map<QuizQuestionId, QuestionGrade> questionGrades) {
        int totalEarned = questionGrades.values().stream()
                .mapToInt(QuestionGrade::getEarnedPoints)
                .sum();
        int totalMax = questionGrades.values().stream()
                .mapToInt(QuestionGrade::getMaxPoints)
                .sum();

        return new TotalPoints(totalEarned, totalMax);
    }

    public record TotalPoints(int earned, int max) {}
}