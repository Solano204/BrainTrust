package com.braintrust.education.application.dtos.dtos;

public record PlagiarismSummaryDTO(
        String plagiarismCheckId,
        String comparedSubmissionId,
        String comparedStudentId,
        String comparedStudentName,
        String overallSimilarityPercentage,
        int similarParagraphsCount,
        String status
) {}
