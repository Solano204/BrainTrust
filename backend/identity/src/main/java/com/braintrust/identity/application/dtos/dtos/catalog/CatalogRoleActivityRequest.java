package com.braintrust.identity.application.dtos.dtos.catalog;

public record CatalogRoleActivityRequest(
        Integer roleId,
        String code,
        String activity,
        String description
) {}