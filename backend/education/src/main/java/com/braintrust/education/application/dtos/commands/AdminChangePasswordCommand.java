package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminChangePasswordCommand(
        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String newPassword
) {}