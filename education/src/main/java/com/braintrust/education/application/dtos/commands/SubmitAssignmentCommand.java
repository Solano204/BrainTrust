package com.braintrust.education.application.dtos.commands;

import com.braintrust.shared.application.dtos.DocumentAttachmentDTO;

import java.util.List;

// 📍 education/application/dtos/commands/SubmitAssignmentCommand.java
public record SubmitAssignmentCommand(
        String assignmentId,
        String studentId,
        String content,
        List<DocumentAttachmentDTO> attachments
) {}