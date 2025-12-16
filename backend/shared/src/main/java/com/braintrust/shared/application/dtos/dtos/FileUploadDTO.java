package com.braintrust.shared.application.dtos.dtos;

public record FileUploadDTO(
        String fileName,
        String originalFileName,
        String fileType,
        long fileSize,
        String url,
        String storagePath
) {}