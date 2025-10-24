package com.braintrust.education.application.dtos.dtos;

// 📍 education/application/dtos/SubmissionAnalyticsDTO.java
public record SubmissionAnalyticsDTO(
        String assignmentId,
        int totalSubmissions,
        int gradedSubmissions,
        int pendingSubmissions,
        int returnedSubmissions,
        String averageGrade,  // BigDecimal as String
        int lateSubmissions,
        int onTimeSubmissions,
        StatusDistributionDTO statusDistribution
) {}