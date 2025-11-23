package com.braintrust.education.application.dtos.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public record SubmissionBasicDTO(
        String id,
        String assignmentId,
        String assignmentTitle,
        String studentId,
        String studentName,
        String status,
        String submittedAt,
        String gradeValue,
        String gradeMaxScore,
        Boolean isTeamSubmission,
        String teamId
) {}
