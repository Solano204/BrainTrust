package com.braintrust.education.domain.model;

import java.util.Arrays;

public enum DocumentType {
    INSTRUCTION, SUBMISSION, MATERIAL;

    public static DocumentType fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Document type cannot be null");
        }
        try {
            return DocumentType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid document type: " + value +
                    ". Valid values: " + Arrays.toString(values()));
        }
    }
}