package com.braintrust.education.application.dtos.commands;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/**
 * Command for creating a page with file attachments and external links
 * ✅ FIXED: Parameter order now matches controller usage
 */
public record CreatePageWithAttachmentsCommand(
        String courseId,              // 1st parameter
        String unitId,                // 2nd parameter ✅ FIXED ORDER
        String title,                 // 3rd parameter ✅ FIXED ORDER
        String content,               // 4th parameter ✅ FIXED ORDER
        List<String> externalLinks,   // 5th parameter
        List<MultipartFile> attachments,  // 6th parameter
        boolean publishImmediately    // 7th parameter
) {
    // Compact constructor for validation (optional)
    public CreatePageWithAttachmentsCommand {
        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID cannot be null or blank");
        }
        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("Unit ID cannot be null or blank");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content cannot be null or blank");
        }
        // Ensure lists are never null
        externalLinks = externalLinks != null ? List.copyOf(externalLinks) : List.of();
        attachments = attachments != null ? List.copyOf(attachments) : List.of();
    }
}