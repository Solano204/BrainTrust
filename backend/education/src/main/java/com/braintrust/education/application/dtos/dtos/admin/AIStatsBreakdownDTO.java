package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record AIStatsBreakdownDTO(
        // Overall average across ALL submissions
        BigDecimal averageAIProbability,

        // 100% AI
        long countFullAI,
        BigDecimal percentageFullAI,

        // 50–99% AI
        long countHighAI,
        BigDecimal percentageHighAI,

        // 1–49% AI
        long countLowAI,
        BigDecimal percentageLowAI,

        // 0% AI (human)
        long countHuman,
        BigDecimal percentageHuman,

        // Total analyzed
        long totalAnalyzed,
        long totalSubmissions
) {}
