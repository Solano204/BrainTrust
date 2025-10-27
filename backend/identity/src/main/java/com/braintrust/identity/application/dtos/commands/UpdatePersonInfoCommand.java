package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/UpdatePersonInfoCommand.java
public record UpdatePersonInfoCommand(
        String personId,
        String firstName,
        String lastName,
        String gender,
        String phone
) {}