package com.braintrust.identity.application.dtos.commands;

public record RegisterTeacherCommand(
    String firstName,
    String lastName,
    String email,
    String password,
    String phone,
    String gender
) {}