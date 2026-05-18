package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class EnrollmentId extends ValueObject {
    private final String value;

    private EnrollmentId(String value) {
        this.value = Objects.requireNonNull(value, "Enrollment ID cannot be null");
    }

    public static EnrollmentId generate() {
        return new EnrollmentId("ENROLL-" + UUID.randomUUID());
    }

    public static EnrollmentId fromString(String value) {
        return new EnrollmentId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }

    @Override
    public String toString() {
        return value;
    }
}