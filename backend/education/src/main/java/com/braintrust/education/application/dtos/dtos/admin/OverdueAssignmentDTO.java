package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

// OverdueAssignmentDTO.java
public record OverdueAssignmentDTO(
        String assignmentId,
        String assignmentTitle,
        String teacherId,
        String teacherName,
        String courseId,
        String courseName,
        String dueDate,
        long daysOverdue,
        BigDecimal aiProbability
) {}
