package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record PlagiarismCheckDTO(
        String id,
        String sourceSubmissionId,
        String comparedSubmissionId,
        String comparedStudentId,
        String comparedStudentName,
        String assignmentId,
        String overallSimilarityPercentage,
        List<SimilarParagraphDTO> similarParagraphs,
        String status,
        String checkedAt
) {}
