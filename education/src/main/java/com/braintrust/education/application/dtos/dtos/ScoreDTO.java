package com.braintrust.education.application.dtos.dtos;

// 📍 education/application/dtos/ScoreDTO.java
public record ScoreDTO(
        int value,
        int maxPoints,
        double percentage
) {}