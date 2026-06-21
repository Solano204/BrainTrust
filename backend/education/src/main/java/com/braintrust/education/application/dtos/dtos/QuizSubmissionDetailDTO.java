package com.braintrust.education.application.dtos.dtos;

import java.math.BigDecimal;
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
        BigDecimal finalGrade,
        boolean canViewResults,
        boolean autoGraded,
        List<GradedQuestionResponseDTO> questionResponses,
        boolean timeExpired,
        String unitId,
        String unitName
) {}