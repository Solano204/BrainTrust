package com.braintrust.education.application.dtos.dtos;


public record CourseUnitDTO(
        String id,
        String courseId,
        String name,
        String urlImage,
        int numUnity,
        String description
) {}