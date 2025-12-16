package com.braintrust.education.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AddMultipleLinksCommand(
        @NotEmpty(message = "Links list cannot be empty")
        List<String> links
) {}