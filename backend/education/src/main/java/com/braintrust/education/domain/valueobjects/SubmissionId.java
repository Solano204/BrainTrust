package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;


public class SubmissionId extends ValueObject {
    private final String value;

    private SubmissionId(String value) {
        this.value = Objects.requireNonNull(value, "Submission ID cannot be null");
    }

    public static SubmissionId generate() {
        return new SubmissionId("SUBM-" + UUID.randomUUID().toString());
    }

    public static SubmissionId fromString(String value) {
        return new SubmissionId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}