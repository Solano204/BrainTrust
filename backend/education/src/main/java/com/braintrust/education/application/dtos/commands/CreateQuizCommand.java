package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record CreateQuizCommand(
        String courseId,
        String title,
        String description,
        String unitId,
        String availableFrom,      // ISO DateTime
        String availableUntil,     // ISO DateTime
        Integer timeLimitMinutes,  // null = no limit
        int maxAttempts,
        boolean shuffleQuestions,
        boolean showCorrectAnswers
) {}