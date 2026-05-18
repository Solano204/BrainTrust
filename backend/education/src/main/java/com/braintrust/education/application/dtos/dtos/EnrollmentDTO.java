package com.braintrust.education.application.dtos.dtos;

public record EnrollmentDTO(
        String id,
        String courseId,
        String courseName,
        String studentId,
        String studentName,
        String studentEmail,
        String studentRefId,
        String enrollmentDate,
        String status,
        GradeDTO finalGrade
) {}