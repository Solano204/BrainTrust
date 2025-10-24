package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/CompleteEnrollmentCommand.java
public record CompleteEnrollmentCommand(
        String enrollmentId,
        String finalGradeValue,
        String finalGradeMaxScore
) {}