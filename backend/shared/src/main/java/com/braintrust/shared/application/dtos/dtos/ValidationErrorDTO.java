package com.braintrust.shared.application.dtos.dtos;

public record ValidationErrorDTO(
        String field,
        String message,
        Object rejectedValue
) {}