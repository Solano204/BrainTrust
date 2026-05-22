package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;
import java.util.List;

// TeacherAssignmentStatsDTO.java
public record TeacherAssignmentStatsDTO(
        String teacherId,
        String teacherName,
        long totalAssignments,
        long aiDetectedCount,
        BigDecimal averageAIProbability,
        List<AssignmentDetailDTO> recentAssignments
) {}
