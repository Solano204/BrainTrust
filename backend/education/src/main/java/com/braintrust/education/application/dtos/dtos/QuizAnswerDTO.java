package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record QuizAnswerDTO(
        String questionId,
        String questionText,
        List<Integer> selectedOptions,
        String textAnswer,
        boolean correct, // Only shown after grading
        int pointsEarned
) {}