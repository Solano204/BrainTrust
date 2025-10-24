package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/CreateAssignmentCommand.java
public record CreateAssignmentCommand(
        String courseId,
        String title,
        String description,
        String dueDate, // ISO-8601 format
        int maxPoints,
        String instructions
) {}