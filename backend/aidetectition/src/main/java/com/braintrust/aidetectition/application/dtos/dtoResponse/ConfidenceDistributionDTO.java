package com.braintrust.aidetectition.application.dtos.dtoResponse;

public record ConfidenceDistributionDTO(
        int high,
        int medium,
        int low
) {}