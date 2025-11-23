package com.braintrust.education.application.dtos.commands;

public record GradeQuizSubmissionCommand(
        String quizSubmissionId,
        int earnedPoints,
        int totalPoints
) {}