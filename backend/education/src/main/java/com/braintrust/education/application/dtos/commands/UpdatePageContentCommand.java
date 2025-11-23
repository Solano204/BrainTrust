package com.braintrust.education.application.dtos.commands;

public record UpdatePageContentCommand(
        String pageId,
        String content
) {}