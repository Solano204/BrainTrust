package com.braintrust.identity.application.dtos.dtos;

import com.braintrust.identity.application.dtos.dtos.catalog.RoleActivityDTO;

import java.time.LocalDateTime;
import java.util.List;

public record UserDTO(
        String id,
        String email,
        String role,
        boolean active,
        LocalDateTime createdAt,
        PersonDTO person,
        String studentId,
        List<RoleActivityDTO> activities
) {}