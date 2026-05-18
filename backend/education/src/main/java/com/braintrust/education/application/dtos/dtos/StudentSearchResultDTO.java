package com.braintrust.education.application.dtos.dtos;

public record StudentSearchResultDTO(
        String userId,
        String personId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String studentRefId,
        boolean isAlreadyEnrolled,
        String enrollmentId,
        String enrollmentStatus
) {}