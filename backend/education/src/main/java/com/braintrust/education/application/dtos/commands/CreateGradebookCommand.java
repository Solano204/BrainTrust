package com.braintrust.education.application.dtos.commands;

public record CreateGradebookCommand(
        String courseId,
        String studentId,
        String assignmentWeightPercentage, // e.g., "40"
        String quizWeightPercentage,       // e.g., "30"
        String unitWeightPercentage        // e.g., "30"
) {}