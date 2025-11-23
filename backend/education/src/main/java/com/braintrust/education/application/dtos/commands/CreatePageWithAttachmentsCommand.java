package com.braintrust.education.application.dtos.commands;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

// ✅ NO VALIDATION ANNOTATIONS AT ALL
public record CreatePageWithAttachmentsCommand(
        String courseId,
        String title,
        String content,
        String unitId,

        List<String> externalLinks,
        List<MultipartFile> attachments,
        boolean publishImmediately
) {
        // Optional: Add null safety in constructor
        public CreatePageWithAttachmentsCommand {
                if (externalLinks == null) {
                        externalLinks = List.of();
                }
                if (attachments == null) {
                        attachments = List.of();
                }
        }
}