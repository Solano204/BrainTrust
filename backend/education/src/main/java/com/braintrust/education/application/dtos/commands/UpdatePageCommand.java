package com.braintrust.education.application.dtos.commands;

public record UpdatePageCommand(
        String pageId,
        String title,
        String content
) {}