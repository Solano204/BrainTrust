package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;
import org.w3c.dom.DocumentType;

import java.time.LocalDateTime;

// 📍 education/domain/model/Document.java - VALUE OBJECT
public class Document extends ValueObject {
    private final String name;
    private final String storagePath;
    private final LocalDateTime createdAt;

    public Document(String name, String fileType, String storagePath,
                    String textContent, DocumentType type) {
        this.name = validateName(name);
        this.storagePath = storagePath;
        this.createdAt = LocalDateTime.now();
    }

    private String validateName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Document name cannot be null or empty");
        }
        return name.trim();
    }

    // Getters
    public String getName() { return name; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{name,  storagePath};
    }
}