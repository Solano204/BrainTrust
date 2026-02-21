package com.braintrust.education.application.dtos.dtos;

public record ScoreDTO(
        int value,
        int maxPoints,
        double percentage
) {}