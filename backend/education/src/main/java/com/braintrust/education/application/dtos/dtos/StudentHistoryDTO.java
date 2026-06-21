package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record StudentHistoryDTO(
        String studentId,
        String studentName,
        String courseId,
        String courseName,
        List<SubmissionHistoryItemDTO> submissions
) {}
