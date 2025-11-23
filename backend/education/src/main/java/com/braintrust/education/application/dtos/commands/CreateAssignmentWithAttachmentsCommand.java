package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record CreateAssignmentWithAttachmentsCommand(
        @NotBlank(message = "Course ID is required")
        String courseId,
@NotBlank(message = "Course ID is required")
        String unitId,

        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
        String description,

        @NotBlank(message = "Due date is required")
        String dueDate,

        @Min(value = 1, message = "Max points must be at least 1")
        int maxPoints,

        @NotBlank(message = "Instructions are required")
        @Size(min = 10, message = "Instructions must be at least 10 characters")
        String instructions,

        // ✅ Attachments
        List<MultipartFile> attachments,

        // ✅ NEW: Assignment target type
        String targetType // "INDIVIDUAL" or "TEAM"

) {}