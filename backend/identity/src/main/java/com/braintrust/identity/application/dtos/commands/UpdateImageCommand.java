package com.braintrust.identity.application.dtos.commands;


// 📍 identity/application/dtos/commands/UpdateImageCommand.java
public record UpdateImageCommand(
        String personId,
        String imagePath
) {}