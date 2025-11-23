package com.braintrust.education.application.dtos.dtos;

public record GradeWeightConfigDTO(
        String assignmentWeight,
        String quizWeight,
        String unitWeight
) {}