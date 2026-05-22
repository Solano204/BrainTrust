package com.braintrust.education.application.dtos.dtos.admin;


import java.util.List;

// UserStatsDTO.java
public record UserStatsDTO(
        long totalTeachers,
        long totalStudents,
        long totalEnrolled,
        List<TeacherCountDTO> teachersWithMostAssignments,
        List<StudentCountDTO> studentsWithMostSubmissions
) {}