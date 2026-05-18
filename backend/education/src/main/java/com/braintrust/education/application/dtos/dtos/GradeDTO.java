package com.braintrust.education.application.dtos.dtos;

public record GradeDTO(
        String value,
        String maxScore,
        String percentage
) {}