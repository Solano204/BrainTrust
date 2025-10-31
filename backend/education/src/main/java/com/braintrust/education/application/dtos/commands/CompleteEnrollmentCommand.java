package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record CompleteEnrollmentCommand(
        @NotBlank(message = "Enrollment ID is required")
        String enrollmentId,

        @NotBlank(message = "Final grade value is required")
        @DecimalMin(value = "0.0", message = "Grade must be at least 0")
        String finalGradeValue,

        @NotBlank(message = "Max score is required")
        @DecimalMin(value = "0.0", message = "Max score must be at least 0")
        String finalGradeMaxScore
) {}