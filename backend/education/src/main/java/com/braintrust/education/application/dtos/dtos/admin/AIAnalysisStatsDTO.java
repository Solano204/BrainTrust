package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

// AIAnalysisStatsDTO.java
public record AIAnalysisStatsDTO(
        BigDecimal percentageFullAI,           // 100% IA
        BigDecimal percentageHighAI,           // 50-99% IA
        BigDecimal percentageLowAI,            // 1-49% IA
        BigDecimal percentageHuman,            // 0% IA
        long countFullAI,
        long countHighAI,
        long countLowAI,
        long countHuman,
        BigDecimal averageAIProbability
) {}