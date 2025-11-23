package com.braintrust.education.application.dtos.commands;

public record RapidGradeUpdateRequest(
        String score,
        String maxScore,
        String feedback
) {}
