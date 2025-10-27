package com.braintrust.education.application.dtos.commands;


import com.braintrust.shared.application.dtos.DocumentAttachmentDTO;

import java.util.List;

// 📍 education/application/dtos/commands/CreateAssignmentWithAttachmentsCommand.java
public record CreateAssignmentWithAttachmentsCommand(
        String courseId,
        String title,
        String description,
        String dueDate,
        int maxPoints,
        String instructions,
        List<DocumentAttachmentDTO> attachments
) {}