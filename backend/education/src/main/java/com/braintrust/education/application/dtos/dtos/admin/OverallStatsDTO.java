package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

// OverallStatsDTO.java
public record OverallStatsDTO(
        long totalAssignments,
        long totalAnalyzed,
        long totalPending,
        BigDecimal percentageAnalyzed
) {}