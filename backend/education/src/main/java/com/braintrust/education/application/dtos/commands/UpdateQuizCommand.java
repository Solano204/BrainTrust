package com.braintrust.education.application.dtos.commands;

public record UpdateQuizCommand(
        String quizId,
        String title,
        String description,
        String availableFrom,
        String availableUntil,
        Integer timeLimitMinutes,
        int maxAttempts,
        boolean shuffleQuestions,
        boolean showCorrectAnswers,
        boolean allowSeeResults,   // ✅ NEW
        double totalScore          // ✅ NEW
) {}