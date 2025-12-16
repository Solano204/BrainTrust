package com.braintrust.education.application.dtos.commands;

public record CourseStatsDTO(
        int totalCourses,
        int activeCourses,
        int inactiveCourses,
        int totalStudents,
        int totalTeachers,
        double averageStudentsPerCourse
) {}