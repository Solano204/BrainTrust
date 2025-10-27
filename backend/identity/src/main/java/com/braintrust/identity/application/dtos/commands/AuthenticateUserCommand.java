package com.braintrust.identity.application.dtos.commands;

// 📍 identity/application/dtos/commands/AuthenticateUserCommand.java
public record AuthenticateUserCommand(
        String email,
        String password
) {}