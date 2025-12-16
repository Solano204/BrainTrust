package com.braintrust.education.application.dtos.commands;

// AddBulkAttachmentsJsonCommand.java
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AddBulkAttachmentsJsonCommand(
        @NotNull(message = "Attachments list is required")
        List<FrontendDocumentDTO> attachments
) {}