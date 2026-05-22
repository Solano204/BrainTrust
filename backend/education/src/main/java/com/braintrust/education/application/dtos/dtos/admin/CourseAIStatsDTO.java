package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record CourseAIStatsDTO(
        String courseId,
        String courseName,
        String teacherId,
        String teacherName,
        long totalSubmissions,
        long aiDetectedSubmissions,
        BigDecimal aiPercentage,          // % submissions flagged as AI
        long lateSubmissions,
        BigDecimal latePercentage,        // % submissions that were late
        BigDecimal averageAIProbability
) {}
