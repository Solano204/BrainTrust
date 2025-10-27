package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

// 📍 education/domain/valueobjects/AssignmentId.java
public class AssignmentId extends ValueObject {
    private final String value;

    private AssignmentId(String value) {
        this.value = Objects.requireNonNull(value, "Assignment ID cannot be null");
    }

    public static AssignmentId generate() {
        return new AssignmentId("ASSIGN-" + UUID.randomUUID().toString());
    }

    public static AssignmentId fromString(String value) {
        return new AssignmentId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}