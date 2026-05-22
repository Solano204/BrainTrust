package com.braintrust.education.application.dtos.dtos.admin;


public record UserCountDTO(
        long totalStudents,
        long totalTeachers,
        long totalActiveStudents,
        long totalActiveTeachers
) {}