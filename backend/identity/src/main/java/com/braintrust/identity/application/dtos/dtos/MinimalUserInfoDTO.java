package com.braintrust.identity.application.dtos.dtos;


public record MinimalUserInfoDTO(
        String userId,
        String personId,
        String firstName,
        String lastName,
        String fullName
) {}