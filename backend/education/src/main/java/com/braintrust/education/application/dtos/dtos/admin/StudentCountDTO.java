package com.braintrust.education.application.dtos.dtos.admin;

import java.math.BigDecimal;

// StudentCountDTO.java
public record StudentCountDTO(
        String studentId,
        String studentName,
        long submissionCount,
        BigDecimal averageGrade
) {}