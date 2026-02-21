package com.braintrust.education.application.dtos.dtos;


import java.time.LocalDateTime;
import java.util.List;

public record CourseDTO(
        String id,
        String code,
        String name,
        String description,
        String urlImage,
        String grade,
        String group,
        String teacherId,
        String teacherName,
        boolean active,
        int studentCount,
        int assignmentCount,
        int unitCount,
        LocalDateTime createdAt
) {}