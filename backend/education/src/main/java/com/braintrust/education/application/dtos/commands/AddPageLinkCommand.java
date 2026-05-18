package com.braintrust.education.application.dtos.commands;

public record AddPageLinkCommand(
        String pageId,
        String url
) {}