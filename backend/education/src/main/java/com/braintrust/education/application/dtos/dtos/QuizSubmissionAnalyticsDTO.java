package com.braintrust.education.application.dtos.dtos;

public record QuizSubmissionAnalyticsDTO(
        String quizId,
        int totalSubmissions,
        int completedSubmissions,
        int inProgressSubmissions,
        String averageScore,
        String highestScore,
        String lowestScore,
        int totalAttempts,
        String averageTimeSpent // In minutes
) {}