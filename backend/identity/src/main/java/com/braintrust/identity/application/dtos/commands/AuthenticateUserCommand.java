package com.braintrust.identity.application.dtos.commands;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
// 📍 identity/application/dtos/commands/AuthenticateUserCommand.java
public record AuthenticateUserCommand(

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {}