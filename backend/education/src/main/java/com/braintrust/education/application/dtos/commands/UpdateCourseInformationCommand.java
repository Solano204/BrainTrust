package com.braintrust.education.application.dtos.commands;

// For comprehensive course update
public record UpdateCourseInformationCommand(
        String courseId,
        String name,
        String description,
        String grade,
        String group,
        String imageUrl,
        boolean active
) {}