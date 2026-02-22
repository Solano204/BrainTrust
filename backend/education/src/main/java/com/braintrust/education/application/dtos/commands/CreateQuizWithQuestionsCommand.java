package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record CreateQuizWithQuestionsCommand(
        String courseId,
        String unitId,
        String title,
        String description,
        String availableFrom,
        String availableUntil,
        Integer timeLimitMinutes,
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