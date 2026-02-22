package com.braintrust.identity.application.dtos.commands;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCompleteUserCommand(

        @NotBlank String firstName,
        @NotBlank String lastName,
        String gender,
        String phone,


        String addressStreet,
        String addressColony,
        String addressMunicipality,
        String addressState,
        String addressPostalCode,


        @NotBlank @Email String email,
        @NotBlank String password,


        @NotNull UserRole role,
        String userId
) {
    public enum UserRole {
        STUDENT, TEACHER, ADMIN
    }
}