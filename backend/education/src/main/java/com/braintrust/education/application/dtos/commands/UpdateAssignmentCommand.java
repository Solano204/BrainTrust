package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record UpdateAssignmentCommand(
        @NotBlank(message = "Assignment ID is required")
        String assignmentId,

        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        String title,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(min = 10, message = "Instructions must be at least 10 characters")
        String instructions,

        String submissionFormat
) {}