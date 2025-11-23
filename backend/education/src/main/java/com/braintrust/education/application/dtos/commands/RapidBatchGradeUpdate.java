package com.braintrust.education.application.dtos.commands;

public record RapidBatchGradeUpdate(
        String studentId,
        String activityType,  // "ASSIGNMENT", "QUIZ", "UNIT"
        String activityId,
        String score,
        String maxScore,
        String feedback
) {}