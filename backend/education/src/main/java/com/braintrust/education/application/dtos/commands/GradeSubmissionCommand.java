package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GradeSubmissionCommand(
        @NotBlank(message = "Submission ID is required")
        String submissionId,

        @NotBlank(message = "Grade value is required")
        @DecimalMin(value = "0.0", message = "Grade must be at least 0")
        String gradeValue,

        @NotBlank(message = "Max score is required")
        @DecimalMin(value = "0.0", message = "Max score must be at least 0")
        String maxScore,

        @Size(max = 1000, message = "Feedback must not exceed 1000 characters")
        String feedback
) {}