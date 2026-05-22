package com.braintrust.education.application.dtos.dtos.admin;
import java.math.BigDecimal;
import java.util.List;

public record AdminStatsDTO(
        OverallStatsDTO overallStats,
        AIAnalysisStatsDTO aiAnalysisStats,
        AssignmentStatsDTO assignmentStats,
        UserStatsDTO userStats,
        DeadlineStatsDTO deadlineStats,
        List<TeacherAssignmentStatsDTO> teacherStats
) {}