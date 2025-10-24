package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/EnrollStudentCommand.java
public record EnrollStudentCommand(
        String courseId,
        String studentId
) {}
