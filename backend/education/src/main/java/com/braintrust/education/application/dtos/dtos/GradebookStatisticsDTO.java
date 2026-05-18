package com.braintrust.education.application.dtos.dtos;

public record GradebookStatisticsDTO(
        int totalAssignments,
        int totalQuizzes,
        int totalUnits,
        String assignmentAverage,
        String quizAverage,
        String unitAverage
) {}