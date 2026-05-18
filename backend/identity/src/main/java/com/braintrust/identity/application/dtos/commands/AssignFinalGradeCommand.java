package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record AssignFinalGradeCommand(
        @NotBlank String gradeValue,
        String feedback,
                String courseId  // NEW FIELD

) {}