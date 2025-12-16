package com.braintrust.education.application.dtos.commands;

public record BulkGradeUpdateCommandDTO(
        String studentId,
        String gradeValue,
        String feedback
) {}