package com.braintrust.education.application.dtos.dtos;

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
        boolean allowSeeResults,
        double totalScore,
        int totalPoints,
        int questionCount,
        String createdAt,
        boolean active,
        boolean availableNow,
        String unitId
) {}