package com.braintrust.education.application.dtos.commands;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateCompletePageCommand(
        @NotBlank String courseId,
        @NotBlank String title,
        @NotBlank String content,

        // External links
        List<String> externalLinks,

        // Attachments
        List<DocumentAttachment> attachments,

        // Publishing options
        boolean publishImmediately
) {
    public record DocumentAttachment(
            @NotBlank String name,
            @NotBlank String storagePath
    ) {}
}