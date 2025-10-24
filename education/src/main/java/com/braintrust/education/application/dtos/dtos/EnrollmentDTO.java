package com.braintrust.education.application.dtos.dtos;
// 📍 education/application/dtos/EnrollmentDTO.java
public record EnrollmentDTO(
        String id,
        String courseId,
        String courseName,
        String studentId,
        String studentName,
        String enrollmentDate,
        String status,  // ACTIVE, COMPLETED, CANCELLED
        GradeDTO finalGrade
) {}
