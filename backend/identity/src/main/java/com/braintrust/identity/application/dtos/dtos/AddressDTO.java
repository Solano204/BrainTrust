package com.braintrust.identity.application.dtos.dtos;


public record AddressDTO(
        String street,
        String colony,
        String municipality,
        String state,
        String postalCode
) {}