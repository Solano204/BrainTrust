package com.braintrust.education.application.dtos.commands;
public record AddUnitGradeFeedbackCommand(
        String unitId,
        String studentId,
        String feedback
) {}