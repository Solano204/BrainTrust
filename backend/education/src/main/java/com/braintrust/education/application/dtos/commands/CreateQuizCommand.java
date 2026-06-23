package com.braintrust.education.application.dtos.commands;

public record CreateQuizCommand(
        String courseId,
        String unitId,
        String title,
        String description,
        String availableFrom,
        String availableUntil,
        Integer timeLimitMinutes,
        boolean allowSeeResults,
        double totalScore
) {}