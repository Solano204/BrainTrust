package com.braintrust.identity.application.dtos.dtos;

import java.time.LocalDateTime;

public record UserDTO(
        String id,
        String email,
        String role,
        boolean active,
        LocalDateTime createdAt,
        PersonDTO person,
        String studentId
) {
}