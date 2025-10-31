package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddUnitWithImageRequest(
        @NotBlank(message = "Unit name is required")
        @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
        String name,

        @Min(value = 1, message = "Order must be at least 1")
        int order,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @NotBlank(message = "Image URL is required")
        String imageUrl
) {}