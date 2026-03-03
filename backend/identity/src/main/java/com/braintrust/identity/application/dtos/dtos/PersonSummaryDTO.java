package com.braintrust.identity.application.dtos.dtos;

public record PersonSummaryDTO(
        String personId,
        String nombreCompleto,
        boolean tieneUsuario
) {}