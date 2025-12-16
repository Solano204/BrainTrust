package com.braintrust.education.application.dtos.commands;


import jakarta.validation.constraints.NotBlank;

public record RemoveAttachmentCommand(
        @NotBlank(message = "Document name is required")
        String documentName
) {}
