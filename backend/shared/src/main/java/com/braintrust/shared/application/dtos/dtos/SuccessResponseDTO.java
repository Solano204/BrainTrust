package com.braintrust.shared.application.dtos.dtos;

public record SuccessResponseDTO(
        boolean success,
        String message,
        Object data
) {}