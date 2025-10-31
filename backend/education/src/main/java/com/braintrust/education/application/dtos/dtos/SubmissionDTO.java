package com.braintrust.education.application.dtos.dtos;



import java.util.List;

// 📍 education/application/dtos/SubmissionDTO.java
public record SubmissionDTO(
        String id,
        String assignmentId,
        String assignmentTitle,
        String studentId,
        String studentName,
        String content,
        String status,  // DRAFT, SUBMITTED, GRADED, RETURNED
        GradeDTO grade,
        String teacherFeedback,
        String submittedAt,
        boolean isLate,
        List<DocumentDTO> attachments,
        AIDetectionResultDTO aiAnalysis
) {}