package com.braintrust.education.application.dtos.commands;

public record UpdateGradeWeightConfigCommand(
        String gradebookId,
        String assignmentWeight,
        String quizWeight,
        String unitWeight
) {}