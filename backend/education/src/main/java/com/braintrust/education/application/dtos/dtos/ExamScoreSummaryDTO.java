package com.braintrust.education.application.dtos.dtos;

public record ExamScoreSummaryDTO(
        int earnedPoints,      // sum of earnedPoints from all questionResponses
        int totalPoints
) {}