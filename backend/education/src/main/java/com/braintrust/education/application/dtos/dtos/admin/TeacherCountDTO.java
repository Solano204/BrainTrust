package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

public record TeacherCountDTO(
        String teacherId,
        String teacherName,
        long assignmentCount,
        BigDecimal averageAIProbability
) {}