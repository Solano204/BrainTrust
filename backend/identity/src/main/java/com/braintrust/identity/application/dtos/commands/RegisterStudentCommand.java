package com.braintrust.identity.application.dtos.commands;

public record RegisterStudentCommand(
        String firstName,
        String lastName,
        String email,
        String password,
        String studentId,
        String phone,
        String gender
) {}