package com.braintrust.identity.application.dtos.commands;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCompleteUserCommand(
        // Personal Information
        @NotBlank String firstName,
        @NotBlank String lastName,
        String gender,
        String phone,

        // Address Information
        String addressStreet,
        String addressColony,
        String addressMunicipality,
        String addressState,
        String addressPostalCode,

        // User Account Information
        @NotBlank @Email String email,
        @NotBlank String password,

        // Role-specific Information
        @NotNull UserRole role,
        String userId  // Only required for STUDENT role
) {
    public enum UserRole {
        STUDENT, TEACHER, ADMIN
    }
}