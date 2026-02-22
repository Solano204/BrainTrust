package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record CreateQuizCommand(
        String courseId,
        String title,
        String description,
        String unitId,
        String availableFrom,
        String availableUntil,
        Integer timeLimitMinutes,
        int maxAttempts,
        boolean shuffleQuestions,
        boolean showCorrectAnswers
) {}