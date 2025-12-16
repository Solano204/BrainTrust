package com.braintrust.education.application.dtos.dtos;

public record UserWithoutGroupDTO(
        String userId,
        String personId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String role,
        String studentRefId // Add this field
) {}