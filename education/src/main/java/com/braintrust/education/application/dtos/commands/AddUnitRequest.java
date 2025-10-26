package com.braintrust.education.application.dtos.commands;

public record AddUnitRequest(
        String name,
        int order,
        String description
) {}