package com.braintrust.education.application.dtos.commands;

import com.braintrust.shared.application.dtos.DocumentAttachmentDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// 📍 New Record to handle the combined Multipart Request
public record SubmitAssignmentCommand(
        // Command Data Fields (These will come from the form-data fields)
        @NotBlank(message = "Assignment ID is required")
        String assignmentId,

        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Content is required")
        @Size(min = 50, message = "Content must be at least 50 characters")
        String content,

        // ⬅️ NEW FIELD: The actual file being uploaded
        List<MultipartFile> attachments


) {}