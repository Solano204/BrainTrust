package com.braintrust.aidetectition.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record FrontendDocumentDTOSub(

        @NotBlank(message = "Original filename is required")
        String originalFilename,
        String uploadedUrl,
        String extractedText
) {




}
