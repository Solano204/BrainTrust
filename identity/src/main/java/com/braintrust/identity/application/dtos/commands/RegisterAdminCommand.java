package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/RegisterAdminCommand.java
public record RegisterAdminCommand(
        String firstName,
        String lastName,
        String email,
        String password,
        String phone,
        String gender
) {}