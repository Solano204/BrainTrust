package com.braintrust.education.application.dtos.dtos;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

// TEAM SUBMISSION DTOs
public record SubmitTeamAssignmentCommandV2(
        @NotBlank(message = "Assignment ID is required")
        String assignmentId,

        @NotBlank(message = "Group ID is required")
        String groupId,

        @NotBlank(message = "Sender ID is required")
        String studentSenderId,

        @NotBlank(message = "Content is required")
        @Size(min = 10, message = "Content must be at least 10 characters")
        String content,

        List<FrontendDocumentDTO> frontendDocuments // ✅ Frontend extracted documents
) {}