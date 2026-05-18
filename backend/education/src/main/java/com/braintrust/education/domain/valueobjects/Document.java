package com.braintrust.education.domain.valueobjects;

import java.time.LocalDateTime;
import java.util.Objects;

public class Document {

    private final String name;
    private final String storagePath;
    private final LocalDateTime createdAt;

    public Document(String name, String storagePath) {
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

    public String getName() { return name; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    /**
     * Equality based on name + storagePath only (NOT createdAt,
     * since reconstituted documents may have a different createdAt
     * than the original in-memory object, causing remove() to fail).
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Document)) return false;
        Document other = (Document) o;
        return Objects.equals(name, other.name)
                && Objects.equals(storagePath, other.storagePath);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, storagePath);
    }

    @Override
    public String toString() {
        return "Document{name='" + name + "', storagePath='" + storagePath + "'}";
    }
}