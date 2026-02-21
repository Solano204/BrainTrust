package com.braintrust.identity.application.dtos.dtos;


public record CompleteUserDTO(
        String userId,
        String personId,
        String email,
        String role,
        boolean active,
        String studentId,


        String firstName,
        String lastName,
        String gender,
        String phone,
        String fullName,
        String registrationDate,
        String imagePath,


        AddressDTO address,

        String createdAt,

        String message
) {}