package com.braintrust.education.application.dtos.commands;


import java.util.List;

public record CreateStudentGroupWithMembersCommand(
        String courseId,
        String name,
        String description,
        List<String> memberIds // List of student IDs to add initially
) {}