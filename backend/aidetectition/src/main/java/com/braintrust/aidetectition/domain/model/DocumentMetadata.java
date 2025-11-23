package com.braintrust.aidetectition.domain.model;

import lombok.Value;

import java.time.LocalDateTime;

/**
 * Metadata about a stored document
 */
public class DocumentMetadata {
    private final String originalFilename;
    private final String storagePath;
    private final LocalDateTime dateCreated;

    public DocumentMetadata(String originalFilename,
                            String storagePath,
                            LocalDateTime dateCreated) {
        this.originalFilename = originalFilename;
        this.storagePath = storagePath;
        this.dateCreated = dateCreated;
    }

    public String getOriginalFilename() { return originalFilename; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getDateCreated() { return dateCreated; }
}
