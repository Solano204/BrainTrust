package com.braintrust.education.application.dtos.dtos;

import java.util.Map;

public record GradebookDTO(
        String id,
        String courseId,
        String courseName,
        String studentId,
        String studentName,  // ✅ This should show actual student name
        String lastCalculated,
        String calculatedTotal,
        String finalGrade,
        String finalFeedback
) {}