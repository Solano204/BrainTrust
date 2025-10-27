package com.braintrust.identity.application.dtos.dtos;

// 📍 identity/application/dtos/PersonDTO.java
public record PersonDTO(
        String id,
        String firstName,
        String lastName,
        String fullName,
        String gender,
        String phone,
        String registrationDate,  // LocalDate as String
        String imagePath,
        AddressDTO address
) {}