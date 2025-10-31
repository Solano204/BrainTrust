package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCourseWithImageCommand(
        @NotBlank(message = "Course code is required")
        @Size(min = 3, max = 20, message = "Code must be between 3 and 20 characters")
        String code,

        @NotBlank(message = "Course name is required")
        @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
        String name,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @NotBlank(message = "Grade is required")
        String grade,

        @NotBlank(message = "Group is required")
        String group,

        @NotBlank(message = "Teacher ID is required")
        String teacherId,

        @NotBlank(message = "Image URL is required")
        String imageUrl
) {}