package com.braintrust.education.application.dtos.dtos;

public record CategoryGradeDTO(
        String categoryName,  // "Assignments", "Quizzes", "Units"
        String average,
        String weight,
        String weightedScore,
        int itemCount
) {}