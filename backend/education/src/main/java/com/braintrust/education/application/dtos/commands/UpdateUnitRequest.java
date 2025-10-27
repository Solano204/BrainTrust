package com.braintrust.education.application.dtos.commands;

public record UpdateUnitRequest(
        String unitId,
        String name,
        String description,
        String urlImage
) {}