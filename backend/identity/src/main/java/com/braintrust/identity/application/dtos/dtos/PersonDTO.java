package com.braintrust.identity.application.dtos.dtos;


public record PersonDTO(
        String id,
        String firstName,
        String lastName,
        String fullName,
        String gender,
        String phone,
        String registrationDate,
        String imagePath,
        AddressDTO address
) {}