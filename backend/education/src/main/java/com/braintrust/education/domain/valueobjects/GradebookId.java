package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class GradebookId extends ValueObject {
    private final String value;

    private GradebookId(String value) {
        this.value = Objects.requireNonNull(value, "Gradebook ID cannot be null");
    }

    public static GradebookId generate() {
        return new GradebookId("GBOOK-" + UUID.randomUUID());
    }

    public static GradebookId fromString(String value) {
        return new GradebookId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}