package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record QuizTopDTO(
        String quizId,
        String quizTitle,
        String courseId,
        String courseName,
        String studentId,
        String studentName,
        BigDecimal grade,           // the best grade obtained
        BigDecimal maxScore,
        BigDecimal percentage,      // grade / maxScore * 100
        String submittedAt,
        int attemptNumber
) {}