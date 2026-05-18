package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record BatchGradeUpdateResponse(
        int successCount,
        int failureCount,
        List<String> errors
) {}