package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record QuizSubmissionDetailDTO(
        String id,
        String quizId,
        String quizTitle,
        String studentId,
        String studentName,
        int attemptNumber,
        String startedAt,
        String submittedAt,
        String status,
        GradeDTO grade,
        boolean autoGraded,
        List<GradedQuestionResponseDTO> questionResponses, // ✅ CHANGED to GradedQuestionResponseDTO
        boolean timeExpired,
        String unitId,
        String unitName
) {}
