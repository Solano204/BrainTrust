package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/ChangeEmailCommand.java
public record ChangeEmailCommand(
        String userId,
        String newEmail
) {}