package com.braintrust.education.application.dtos.commands;


public record CreateStudentGroupCommand(
        String courseId,
        String name,
        String description
) {}
