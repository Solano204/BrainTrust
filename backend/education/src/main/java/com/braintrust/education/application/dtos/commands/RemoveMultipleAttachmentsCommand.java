package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RemoveMultipleAttachmentsCommand(
        @NotEmpty(message = "Document names list cannot be empty")
        List<String> documentNames
) {}