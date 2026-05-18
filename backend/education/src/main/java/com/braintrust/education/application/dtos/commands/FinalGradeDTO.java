package com.braintrust.education.application.dtos.commands;

public record FinalGradeDTO(
        String calculatedTotal,
        String finalGrade,
        String finalFeedback,
        String lastCalculated
) {}