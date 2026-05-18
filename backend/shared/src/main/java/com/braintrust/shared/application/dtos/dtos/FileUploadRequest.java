package com.braintrust.shared.application.dtos.dtos;
public record FileUploadRequest(
        String fileName,
        String fileType,
        byte[] content
) {}
