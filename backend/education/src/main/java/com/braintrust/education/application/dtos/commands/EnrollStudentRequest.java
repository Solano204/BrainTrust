package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record EnrollStudentRequest(
        @NotBlank(message = "Student ID is required")
        String studentId
) {}