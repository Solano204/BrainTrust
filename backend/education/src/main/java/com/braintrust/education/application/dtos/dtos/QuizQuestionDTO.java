package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record QuizQuestionDTO(
        String id,
        String questionText,
        String questionType,
        int points,
        List<QuestionOptionDTO> options, // For multiple choice
        String correctAnswer // Hidden for students
) {}
