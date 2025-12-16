package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record RemoveLinkCommand(
//        @NotBlank(message = "Assignment ID is required")
//        String assignmentId,

        @NotBlank(message = "Link URL is required")
        String linkUrl
) {}