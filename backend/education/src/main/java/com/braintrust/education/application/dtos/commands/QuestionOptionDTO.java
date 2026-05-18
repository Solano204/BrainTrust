package com.braintrust.education.application.dtos.commands;

public record QuestionOptionDTO(
        String text,
        boolean correct
) {}