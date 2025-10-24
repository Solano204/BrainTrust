package com.braintrust.shared.application.dtos;

public record DocumentAttachmentDTO(
        String name,
        String fileType,
        String storagePath,
        String textContent,
        String documentType  // INSTRUCTION, SUBMISSION, MATERIAL
) {}