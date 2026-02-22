package com.braintrust.education.application.dtos.dtos;

/**
 * DTO for course statistics
 */
public record CourseStatsDTO(
        int totalCourses,
        int activeCourses,
        int inactiveCourses,
        int totalStudents,
        int totalTeachers,
        double averageStudentsPerCourse
) {
}