package com.braintrust.education.application.dtos.commands;


import java.util.List;
import java.util.Map;

public record SubmitQuizWithAnswersCommand(
        String quizId,
        String studentId,
        Map<String, QuizAnswerData> answers // questionId -> answer data
) {
    public record QuizAnswerData(
            List<Integer> selectedOptions, // for multiple choice
            String textAnswer, // for open-ended
            Long timeSpentSeconds // optional
    ) {}
}