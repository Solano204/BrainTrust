package com.braintrust.education.application.dtos.dtos;


import com.braintrust.aidetectition.application.dtos.dtoResponse.DetectedSegmentDTO;

import java.util.List;

public record SubmissionDTO(
        String id,
        String assignmentId,
        String assignmentTitle,
        String studentId,
        String studentName,
        String status,
        GradeDTO grade,
        String teacherFeedback,
        String submittedAt,
        boolean isLate,
        List<DocumentDTO> attachments,
        AIDetectionResultDTO aiAnalysis, // ✅ This already contains detectedSegments
        String teamId,
        String teamName,
        boolean isTeamSubmission,
        String unitId,
        String unitName,
        String deliveryMode,
        String assignmentTargetType,
        String submissionFormat
) {
    // ✅ Optional: Add helper method to get AI segments easily
    public List<DetectedSegmentDTO> getAiSegments() {
        return aiAnalysis != null ? aiAnalysis.detectedSegments() : List.of();
    }

    // ✅ Helper method to check if AI analysis is available
    public boolean hasAiAnalysis() {
        return aiAnalysis != null && aiAnalysis.status() != null
                && "COMPLETED".equals(aiAnalysis.status());
    }
}