package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record UnenrollStudentCommand(
        @NotBlank(message = "Course ID is required")
        String courseId,

        @NotBlank(message = "Student ID is required")
        String studentId
) {}