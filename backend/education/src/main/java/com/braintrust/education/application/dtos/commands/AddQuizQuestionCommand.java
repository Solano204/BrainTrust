package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record AddQuizQuestionCommand(
        String quizId,
        String questionText,
        String questionType,       // MULTIPLE_CHOICE, OPEN_ENDED, TRUE_FALSE
        int points,
        List<QuestionOptionDTO> options, // For multiple choice
        String correctAnswer       // For open-ended
) {}