package com.braintrust.education.application.dtos.dtos;

public record FileUploadDTO(
        String fileName,
        String originalFileName,
        String fileType,
        long fileSize,
        String url,
        String storagePath
) {}