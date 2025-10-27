package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/UpdateCourseCommand.java
public record UpdateCourseCommand(
        String courseId,
        String name,
        String description,
        String grade,
        String group
) {}