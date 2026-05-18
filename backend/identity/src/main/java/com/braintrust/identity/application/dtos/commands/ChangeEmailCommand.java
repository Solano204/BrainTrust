package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailCommand(
        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "New email is required")
        @Email(message = "Email must be valid")
        String newEmail
) {}