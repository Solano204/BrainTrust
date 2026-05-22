package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record LateSubmissionDTO(
        String submissionId,
        String assignmentId,
        String assignmentTitle,
        String courseId,
        String courseName,
        String studentId,
        String studentName,
        String dueDate,
        String submittedAt,
        long minutesLate,
        BigDecimal aiProbability,
        String grade
) {}
