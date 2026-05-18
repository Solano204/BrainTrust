package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record GradebookSummaryDTO(
        String studentId,
        String studentName,
        String courseId,
        String courseName,
        String overallPercentage,
        String letterGrade,
        List<CategoryGradeDTO> categoryGrades,
        String lastUpdated
) {}
