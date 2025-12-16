package com.braintrust.education.application.dtos.dtos;


import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

// ✅ NEW: Question response with grade information
public record GradedQuestionResponseDTO(
        String questionId,
        String questionText,
        String questionType,
        int maxPoints,
        int earnedPoints, // ✅ Points earned for this specific question
        String teacherFeedback, // ✅ Teacher's feedback (optional)
        boolean isAutoGraded, // ✅ Whether this was auto-graded
        List<QuestionOptionDTO> options,
        List<Integer> selectedOptions,
        String textAnswer,
        String correctAnswer,
        boolean isCorrect
) {}