package com.braintrust.identity.application.dtos.dtos;

import java.time.LocalDateTime;

public record UserDTO(
        String id,
        String email,
        String role,  // TEACHER, STUDENT, ADMIN
        boolean active,
        LocalDateTime createdAt,
        PersonDTO person,
        String studentId  // Only for students, null otherwise
) {
}