package com.braintrust.education.application.dtos.commands;

public record StartQuizCommand(
        String quizId,
        String studentId
) {}
