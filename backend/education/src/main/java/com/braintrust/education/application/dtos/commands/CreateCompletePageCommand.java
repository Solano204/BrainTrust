package com.braintrust.education.application.dtos.commands;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateCompletePageCommand(
        @NotBlank String courseId,
        @NotBlank String title,
        @NotBlank String content,

        List<String> externalLinks,

        List<DocumentAttachment> attachments,

        boolean publishImmediately
) {
    public record DocumentAttachment(
            @NotBlank String name,
            @NotBlank String storagePath
    ) {}
}