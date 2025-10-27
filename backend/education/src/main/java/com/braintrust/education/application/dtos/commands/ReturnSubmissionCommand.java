package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/ReturnSubmissionCommand.java
public record ReturnSubmissionCommand(
        String submissionId,
        String feedback
) {}