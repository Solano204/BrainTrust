package com.braintrust.education.application.dtos.commands;


import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreatePageFrontendDTO(
        @NotBlank(message = "Course ID is required")
        String courseId,

        @NotBlank(message = "Unit ID is required")
        String unitId,

        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
        String title,

        @NotBlank(message = "Content is required")
        @Size(min = 10, message = "Content must be at least 10 characters")
        String content,

        // ✅ Frontend-extracted documents (metadata + text)
        List<FrontendDocumentDTO> attachments,

        List<String> externalLinks,
        boolean publishImmediately
) {}