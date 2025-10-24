package com.braintrust.education.application.dtos.commands;


// 📍 education/application/dtos/commands/AddUnitWithImageCommand.java
public record AddUnitWithImageCommand(
        String courseId,
        String name,
        int order,
        String description,
        String imageUrl
) {}
