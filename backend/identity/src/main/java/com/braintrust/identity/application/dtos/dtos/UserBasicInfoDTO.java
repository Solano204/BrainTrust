package com.braintrust.identity.application.dtos.dtos;

// 📍 identity/application/dtos/UserBasicInfoDTO.java
public record UserBasicInfoDTO(
        String userId,
        String fullName,
        String email,
        String role,
        boolean active
) {}