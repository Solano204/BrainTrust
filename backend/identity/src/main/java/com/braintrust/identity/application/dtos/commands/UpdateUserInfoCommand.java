package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/UpdateUserInfoCommand.java
public record UpdateUserInfoCommand(
        String userId,
        String firstName,
        String lastName,
        String gender,
        String phone
) {}