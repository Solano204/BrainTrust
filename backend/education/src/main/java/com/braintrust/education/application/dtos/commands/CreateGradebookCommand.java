package com.braintrust.education.application.dtos.commands;

public record CreateGradebookCommand(
        String courseId,
        String studentId,
        String assignmentWeightPercentage,
        String quizWeightPercentage,
        String unitWeightPercentage
) {}