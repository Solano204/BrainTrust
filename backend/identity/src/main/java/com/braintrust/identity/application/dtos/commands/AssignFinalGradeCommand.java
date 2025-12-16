package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record AssignFinalGradeCommand(
        @NotBlank String gradeValue,
        String feedback
) {}