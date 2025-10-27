package com.braintrust.education.application.dtos.commands;

public record AddUnitWithImageRequest(
        String name,
        int order,
        String description,
        String imageUrl
) {}