package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/ChangePasswordCommand.java
public record ChangePasswordCommand(
        String userId,
        String currentPassword,
        String newPassword
) {}