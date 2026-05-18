package com.braintrust.education.application.dtos.dtos;


public record SubmissionAnalyticsDTO(
        String assignmentId,
        int totalSubmissions,
        int gradedSubmissions,
        int pendingSubmissions,
        int returnedSubmissions,
        String averageGrade,
        int lateSubmissions,
        int onTimeSubmissions,
        StatusDistributionDTO statusDistribution
) {}