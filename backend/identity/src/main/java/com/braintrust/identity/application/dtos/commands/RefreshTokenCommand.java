package com.braintrust.identity.application.dtos.commands;
import jakarta.validation.constraints.NotBlank;

public record RefreshTokenCommand(

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {}