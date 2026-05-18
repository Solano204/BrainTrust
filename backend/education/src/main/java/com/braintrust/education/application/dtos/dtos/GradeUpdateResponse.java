package com.braintrust.education.application.dtos.dtos;

public record GradeUpdateResponse(
        boolean success,
        String message,
        String activityId
) {}