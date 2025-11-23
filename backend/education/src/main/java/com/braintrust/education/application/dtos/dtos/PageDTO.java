package com.braintrust.education.application.dtos.dtos;

import java.util.List;

public record PageDTO(
        String id,
        String courseId,
        String unitId,
        String courseName,
        String unitName,
        String title,
        String content,
        List<DocumentDTO> attachments,
        List<String> externalLinks,
        String createdAt,
        String lastModified,
        boolean published
) {}