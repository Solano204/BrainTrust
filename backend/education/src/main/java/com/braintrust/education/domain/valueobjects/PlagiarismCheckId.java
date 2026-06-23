package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class PlagiarismCheckId extends ValueObject {
    private final String value;

    private PlagiarismCheckId(String value) {
        this.value = Objects.requireNonNull(value, "PlagiarismCheckId cannot be null");
    }

    public static PlagiarismCheckId generate() {
        return new PlagiarismCheckId("PLAG-" + UUID.randomUUID());
    }

    public static PlagiarismCheckId fromString(String value) {
        return new PlagiarismCheckId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}
