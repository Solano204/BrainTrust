package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record QuizDTO(
        String id,
        String courseId,
        String courseName,
        String title,
        String description,
        String availableFrom,
        String availableUntil,
        Integer timeLimitMinutes,
        int maxAttempts,
        boolean shuffleQuestions,
        boolean showCorrectAnswers,
        int totalPoints,
        int questionCount,
        String createdAt,
        boolean active,
        boolean availableNow,
        String unitId
) {}