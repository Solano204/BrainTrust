package com.braintrust.education.application.dtos.dtos;

import java.util.Map;


public record UnitGradeDTO(
        String id,
        String unitId,
        String unitName,
        String studentId,
        String studentName,
        GradeDTO grade,
        Map<String, GradeDTO> assignmentGrades,
        Map<String, GradeDTO> quizGrades,
        String feedback,
        String lastCalculated,
        String calculatedTotal,
        String finalGrade,
        String finalFeedback
) {}