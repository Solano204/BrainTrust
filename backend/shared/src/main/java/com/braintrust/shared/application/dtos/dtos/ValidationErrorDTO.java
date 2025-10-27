package com.braintrust.shared.application.dtos.dtos;

// 📍 shared/application/dtos/ValidationErrorDTO.java
public record ValidationErrorDTO(
        String field,
        String message,
        Object rejectedValue
) {}