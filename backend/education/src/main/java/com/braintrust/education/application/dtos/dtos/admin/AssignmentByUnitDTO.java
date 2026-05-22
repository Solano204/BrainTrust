package com.braintrust.education.application.dtos.dtos.admin;


import java.math.BigDecimal;

// AssignmentByUnitDTO.java
public record AssignmentByUnitDTO(
        String unitId,
        String unitName,
        long count,
        BigDecimal averageAIProbability
) {}