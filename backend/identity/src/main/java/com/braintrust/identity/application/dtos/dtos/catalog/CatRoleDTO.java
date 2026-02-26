package com.braintrust.identity.application.dtos.dtos.catalog;

import java.util.List;

public record CatRoleDTO(
        Integer id,
        String code,
        String description,
        List<RoleActivitySummaryDTO> activities
) {
    public record RoleActivitySummaryDTO(
            Integer id,
            String code,
            String activity,
            String description
    ) {}
}