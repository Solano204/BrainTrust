package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePersonAddressCommand(
        @NotBlank(message = "Person ID is required")
        String personId,

        @NotBlank(message = "Street is required")
        @Size(max = 100, message = "Street must not exceed 100 characters")
        String street,

        @NotBlank(message = "Colony is required")
        @Size(max = 50, message = "Colony must not exceed 50 characters")
        String colony,

        @NotBlank(message = "Municipality is required")
        @Size(max = 50, message = "Municipality must not exceed 50 characters")
        String municipality,

        @NotBlank(message = "State is required")
        @Size(max = 50, message = "State must not exceed 50 characters")
        String state,

        @NotBlank(message = "Postal code is required")
        @Pattern(regexp = "^\\d{5}$", message = "Postal code must be 5 digits")
        String postalCode
) {}