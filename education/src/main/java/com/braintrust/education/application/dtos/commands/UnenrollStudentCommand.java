package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/UnenrollStudentCommand.java
public record UnenrollStudentCommand(
        String courseId,
        String studentId
) {}
