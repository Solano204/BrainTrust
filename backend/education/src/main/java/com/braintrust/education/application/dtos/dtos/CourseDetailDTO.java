package com.braintrust.education.application.dtos.dtos;

import java.util.List;


public record CourseDetailDTO(
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
        List<EnrollmentDTO> enrollments,
        List<CourseUnitDTO> units,
        List<AssignmentDTO> assignments
) {}
