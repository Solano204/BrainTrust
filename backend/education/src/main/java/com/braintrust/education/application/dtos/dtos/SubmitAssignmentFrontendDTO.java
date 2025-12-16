package com.braintrust.education.application.dtos.dtos;


import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

// ✅ OPTION 1: DTO for pure frontend extraction (NO file uploads)
public record SubmitAssignmentFrontendDTO(
        @NotBlank(message = "Assignment ID is required")
        String assignmentId,

        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Content is required")
        @Size(min = 10, message = "Content must be at least 10 characters")
        String content,

        // ✅ ONLY extracted text and metadata from frontend
        List<FrontendDocumentDTOSub> frontendDocuments
) {}