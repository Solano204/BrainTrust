package com.braintrust.education.application.dtos.dtos;

public record GradeDTO(
        String value,      // BigDecimal as String
        String maxScore,   // BigDecimal as String
        String percentage  // e.g., "85.50"
) {}