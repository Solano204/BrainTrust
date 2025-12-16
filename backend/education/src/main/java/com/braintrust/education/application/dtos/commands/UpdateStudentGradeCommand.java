package com.braintrust.education.application.dtos.commands;

public record UpdateStudentGradeCommand(
        String studentId,
        String gradeValue,
        String feedback
) {}