package com.braintrust.education.application.dtos.dtos;

// 📍 education/application/dtos/CourseUnitDTO.java
public record CourseUnitDTO(
        String id,
        String courseId,
        String name,
        String urlImage,
        int numUnity,
        String description
) {}