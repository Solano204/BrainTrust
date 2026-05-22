package com.braintrust.education.application.dtos.dtos.admin;


import java.util.List;

// AssignmentStatsDTO.java
public record AssignmentStatsDTO(
        long totalActive,
        long totalInactive,
        long totalGroupAssignments,
        long totalIndividualAssignments,
        List<AssignmentByUnitDTO> assignmentsByUnit
) {}
