package com.braintrust.aidetectition.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record RetryAnalysisCommand(
        @NotBlank(message = "Analysis ID is required")
        String analysisId
) {}