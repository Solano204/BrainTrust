package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record QuestionResponseDTO(
        String questionId,
        String questionText,
        String questionType,
        int points,
        List<QuestionOptionDTO> options,
        List<Integer> selectedOptions, // Student's selected options
        String textAnswer, // Student's text answer
        String correctAnswer, // Correct answer (for teacher view)
        boolean isCorrect // Whether the answer is correct
) {}