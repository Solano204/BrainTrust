package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record CompleteQuizQuestionDTO(
        String id,
        String questionText,
        String questionType,
        int points,
        List<QuestionOptionDTO> options,
        String correctAnswer  // ✅ This will include the correct answer
) {}