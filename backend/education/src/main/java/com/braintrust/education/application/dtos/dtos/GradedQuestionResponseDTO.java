package com.braintrust.education.application.dtos.dtos;


import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record GradedQuestionResponseDTO(
        String questionId,
        String questionText,
        String questionType,
        int maxPoints,
        int earnedPoints,
        String teacherFeedback,
        boolean isAutoGraded,
        List<QuestionOptionDTO> options,
        List<Integer> selectedOptions,
        String textAnswer,
        String correctAnswer,
        boolean isCorrect

) {}