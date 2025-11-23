package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record SubmitAssignmentCommand(
        @NotBlank(message = "Assignment ID is required")
        String assignmentId,

        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Content is required")
        @Size(min = 10, message = "Content must be at least 10 characters")
        String content,

        // ✅ FLEXIBLE: Can be null/empty for submissions without attachments
        List<MultipartFile> attachments

        // ✅ FLEXIBLE: Optional team/group ID - if provided, it's a team submission
//        String teamId

) {}