package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record SubmissionHistoryItemDTO(
        String submissionId,
        String assignmentId,
        String assignmentName,
        String unitId,
        String unitName,
        int unitOrder,
        String submittedAt,
        String status,
        GradeDTO grade,
        boolean isLate,
        String aiProbabilityPercentage,
        boolean isLikelyAI,
        boolean hasAiAnalysis,
        List<SimilarParagraphDTO> allSegments,
        List<PlagiarismSummaryDTO> plagiarismMatches
) {}
