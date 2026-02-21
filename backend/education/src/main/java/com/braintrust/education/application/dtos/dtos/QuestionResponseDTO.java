package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record QuestionResponseDTO(
        String questionId,
        String questionText,
        String questionType,
        int points,
        List<QuestionOptionDTO> options,
        List<Integer> selectedOptions,
        String textAnswer,
        String correctAnswer,
        boolean isCorrect
) {}