package com.braintrust.education.application.dtos.commands;

public record CreateUnitCommand(
        String courseId,
        String name,
        int numUnity,
        String description,
        String urlImage
) {}
