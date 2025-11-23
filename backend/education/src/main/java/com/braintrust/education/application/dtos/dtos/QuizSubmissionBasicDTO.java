package com.braintrust.education.application.dtos.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public record QuizSubmissionBasicDTO(
        String id,
        String quizId,
        String quizTitle,
        String studentId,
        String studentName,
        String status,
        String submittedAt,
        Integer attemptNumber
) {}
