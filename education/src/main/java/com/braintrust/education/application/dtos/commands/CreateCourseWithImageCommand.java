package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/CreateCourseWithImageCommand.java
public record CreateCourseWithImageCommand(
        String code,
        String name,
        String description,
        String grade,
        String group,
        String teacherId,
        String imageUrl
) {}