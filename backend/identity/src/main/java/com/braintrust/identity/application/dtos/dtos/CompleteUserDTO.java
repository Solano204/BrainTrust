package com.braintrust.identity.application.dtos.dtos;


public record CompleteUserDTO(
        String userId,
        String personId,
        String email,
        String role,
        boolean active,
        String studentId,

        // Personal Information
        String firstName,
        String lastName,
        String gender,
        String phone,
        String fullName,
        String registrationDate,
        String imagePath,

        // Address Information
        AddressDTO address,

        // Timestamps
        String createdAt,

        // Success message
        String message
) {}