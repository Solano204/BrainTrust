package com.braintrust.identity.application.dtos.dtos.catalog;

public record CatalogRoleActivityDTO(
        Integer id,
        Integer roleId,
        String roleCode,
        String code,
        String activity,
        String description
) {}