package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record AIAssignmentPageDTO(
        String assignmentId,
        String assignmentTitle,
        String courseId,
        String courseName,
        String dueDate,
        BigDecimal aiProbability,
        String analysisStatus,
        // Student who submitted the work that was flagged
        String studentId,
        String studentName,
        String studentEmail,
        // Submission info
        String submissionId,
        String submittedAt,
        boolean isLate
) {}
