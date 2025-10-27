package com.braintrust.education.application.dtos.commands;

// 📍 education/application/dtos/commands/GradeSubmissionCommand.java
public record GradeSubmissionCommand(
        String submissionId,
        String gradeValue,  // BigDecimal as String
        String maxScore,    // BigDecimal as String
        String feedback
) {}