package com.braintrust.identity.application.dtos.commands;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterUserForExistingPersonCommand(
        @NotBlank String personId,
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotNull String role,
        String studentId  // opcional, solo requerido si role = STUDENT
) {}