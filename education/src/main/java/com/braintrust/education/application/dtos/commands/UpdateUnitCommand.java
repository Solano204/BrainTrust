package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/UpdateUnitCommand.java
public record UpdateUnitCommand(
        String unitId,
        String name,
        String description
) {}