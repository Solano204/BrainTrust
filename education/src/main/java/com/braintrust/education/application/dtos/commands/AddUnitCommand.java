package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/AddUnitCommand.java
public record AddUnitCommand(
        String courseId,
        String name,
        int order,
        String description
) {}