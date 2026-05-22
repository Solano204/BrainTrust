package com.braintrust.education.application.dtos.dtos.admin;


import java.util.List;

// DeadlineStatsDTO.java
public record DeadlineStatsDTO(
        long overdue,
        long dueSoon,
        long upcoming,
        List<OverdueAssignmentDTO> overdueAssignments
) {}