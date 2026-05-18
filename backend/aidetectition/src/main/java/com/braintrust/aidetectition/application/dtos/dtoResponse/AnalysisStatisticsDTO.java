package com.braintrust.aidetectition.application.dtos.dtoResponse;

public record AnalysisStatisticsDTO(
        String startDate,
        String endDate,
        int totalAnalyses,
        int completedAnalyses,
        int failedAnalyses,
        int pendingAnalyses,
        String averageProcessingTimeSeconds,
        ModelUsageStatsDTO modelUsage,
        ConfidenceDistributionDTO confidenceDistribution,
        int highRiskDetections,
        int mediumRiskDetections,
        int lowRiskDetections
) {}