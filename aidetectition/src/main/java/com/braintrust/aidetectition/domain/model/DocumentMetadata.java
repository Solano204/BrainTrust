package com.braintrust.aidetectition.domain.model;

import lombok.Value;

import java.time.LocalDateTime;

/**
 * Metadata about a stored document
 */
@Value
public class DocumentMetadata {
    String originalFilename;
    String storagePath;
    LocalDateTime dateCreated;

}