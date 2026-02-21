package com.braintrust.aidetectition.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record FrontendDocumentDTO(
        @NotBlank(message = "Original filename is required")
        String originalFilename,
        String uploadedUrl

) {}
