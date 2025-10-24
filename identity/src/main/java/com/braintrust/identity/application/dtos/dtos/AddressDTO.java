package com.braintrust.identity.application.dtos.dtos;

// 📍 identity/application/dtos/AddressDTO.java
public record AddressDTO(
        String street,
        String colony,
        String municipality,
        String state,
        String postalCode
) {}