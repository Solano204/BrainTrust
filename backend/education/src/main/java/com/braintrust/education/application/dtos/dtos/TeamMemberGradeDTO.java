package com.braintrust.education.application.dtos.dtos;

public record TeamMemberGradeDTO(
        String studentId,
        String studentName,
        GradeDTO grade,
        String appliedAt
) {}