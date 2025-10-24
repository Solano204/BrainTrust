package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/UpdatePersonAddressCommand.java
public record UpdatePersonAddressCommand(
        String personId,
        String street,
        String colony,
        String municipality,
        String state,
        String postalCode
) {}