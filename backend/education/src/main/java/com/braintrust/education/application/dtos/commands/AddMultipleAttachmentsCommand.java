package com.braintrust.education.application.dtos.commands;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

// For adding multiple attachments
public record AddMultipleAttachmentsCommand(
        @NotEmpty(message = "Files list cannot be empty")
        List<MultipartFile> files
) {}