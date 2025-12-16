package com.braintrust.education.application.dtos.commands;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public record AddAttachmentCommand(
        @NotNull(message = "File is required")
        MultipartFile file
) {}
