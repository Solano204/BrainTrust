package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record RemoveLinkCommand(

        @NotBlank(message = "Link URL is required")
        String linkUrl
) {}