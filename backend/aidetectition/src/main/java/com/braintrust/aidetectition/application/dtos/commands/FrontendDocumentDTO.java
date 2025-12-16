package com.braintrust.aidetectition.application.dtos.dtos;

import jakarta.validation.constraints.NotBlank;

public record FrontendDocumentDTO(
        @NotBlank(message = "Original filename is required")
        String originalFilename,
        String uploadedUrl
      //  Long fileSize, // Optional: file size in bytes
       // String mimeType, // Optional: MIME type
       // String fileHash // Optional: hash for verification

) {}
