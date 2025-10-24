package com.braintrust.education.application.dtos.dtos;
// 📍 education/application/dtos/StatusDistributionDTO.java
public record StatusDistributionDTO(
        int draft,
        int submitted,
        int graded,
        int returned
) {}