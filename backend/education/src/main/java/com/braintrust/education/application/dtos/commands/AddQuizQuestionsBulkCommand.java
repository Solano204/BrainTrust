package com.braintrust.education.application.dtos.commands;

import java.util.List;

// For bulk adding questions
public record AddQuizQuestionsBulkCommand(
        String quizId,
        List<QuizQuestionData> questions
) {
    public record QuizQuestionData(
            String questionText,
            String questionType,
            int points,
            List<QuestionOptionData> options,
            String correctAnswer
    ) {}

    public record QuestionOptionData(
            String text,
            boolean correct
    ) {}
}