package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/UpdateAssignmentCommand.java
public record UpdateAssignmentCommand(
        String assignmentId,
        String title,
        String description,
        String instructions
) {}