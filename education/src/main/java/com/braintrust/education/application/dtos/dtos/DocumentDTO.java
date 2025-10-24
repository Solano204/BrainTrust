package com.braintrust.education.application.dtos.dtos;

// 📍 education/application/dtos/DocumentDTO.java
public record DocumentDTO(
        String name,
        String storagePath,
        String createdAt,
        String documentType,  // INSTRUCTION, SUBMISSION, MATERIAL
        long fileSizeBytes
) {}