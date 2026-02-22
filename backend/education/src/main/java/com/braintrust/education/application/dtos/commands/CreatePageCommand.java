package com.braintrust.education.application.dtos.commands;

public record CreatePageCommand(
        String courseId,
        String title,
        String unitId,
        String content
) {}