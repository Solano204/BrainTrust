package com.braintrust.shared.application.dtos.dtos;

// 📍 shared/application/dtos/SuccessResponseDTO.java
public record SuccessResponseDTO(
        boolean success,
        String message,
        Object data
) {}