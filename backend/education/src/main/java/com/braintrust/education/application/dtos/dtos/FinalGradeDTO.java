package com.braintrust.education.application.dtos.dtos;

public record FinalGradeDTO(
        String calculatedTotal,
        String finalGrade,
        String finalFeedback,
        String lastCalculated
) {}