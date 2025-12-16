package com.braintrust.education.application.dtos.dtos;

public record StudentSearchResultDTO(
        String userId,
        String personId,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String studentRefId,  // Student reference ID
        boolean isAlreadyEnrolled,
        String enrollmentId, // null if not enrolled
        String enrollmentStatus // ACTIVE, COMPLETED, CANCELLED if enrolled
) {}