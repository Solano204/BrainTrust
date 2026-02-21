package com.braintrust.education.application.dtos.dtos;

public record StatusDistributionDTO(
        int draft,
        int submitted,
        int graded,
        int returned
) {}