package com.braintrust.education.application.dtos.dtos;


public record GroupMemberDTO(
        String userId,
        String personId,
        String firstName,
        String lastName,
        String fullName
) {}