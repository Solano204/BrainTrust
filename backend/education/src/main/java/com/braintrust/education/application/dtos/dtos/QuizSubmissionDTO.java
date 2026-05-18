package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record QuizSubmissionDTO(
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
        List<QuizAnswerDTO> answers,
        boolean timeExpired,
        String unitId,
        String unitName
) {}