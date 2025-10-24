package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/CreatePersonCommand.java
public record CreatePersonCommand(
        String firstName,
        String lastName,
        String gender,
        String phone
) {}