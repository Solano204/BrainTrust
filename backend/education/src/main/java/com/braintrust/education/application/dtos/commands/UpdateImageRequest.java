package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record UpdateImageRequest(
        @NotBlank(message = "Image URL is required")
        String imageUrl
) {}