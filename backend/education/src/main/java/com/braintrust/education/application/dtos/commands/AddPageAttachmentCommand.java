package com.braintrust.education.application.dtos.commands;

public record AddPageAttachmentCommand(
        String pageId,
        String documentName,
        String storagePath
) {}