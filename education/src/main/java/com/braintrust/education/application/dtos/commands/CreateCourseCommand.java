package com.braintrust.education.application.dtos.commands;

public record CreateCourseCommand(
        String code,
        String name,
        String description,
        String grade,
        String group,
        String teacherId
) {}