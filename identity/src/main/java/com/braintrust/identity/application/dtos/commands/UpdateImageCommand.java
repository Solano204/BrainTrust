package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record UpdateImageCommand(
        @NotBlank(message = "Person ID is required")
        String personId,

        @NotBlank(message = "Image path is required")
        String imagePath
) {}