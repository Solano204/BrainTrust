package com.braintrust.education.application.dtos.commands;


import java.util.List;
import java.util.Map;

public record SubmitQuizWithAnswersCommand(
        String quizId,
        String studentId,
        Map<String, QuizAnswerData> answers
) {
    public record QuizAnswerData(
            List<Integer> selectedOptions,
            String textAnswer,
            Long timeSpentSeconds
    ) {}
}