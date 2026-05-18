package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReturnSubmissionCommand(
        @NotBlank(message = "Submission ID is required")
        String submissionId,

        @NotBlank(message = "Feedback is required")
        @Size(min = 10, max = 1000, message = "Feedback must be between 10 and 1000 characters")
        String feedback
) {}