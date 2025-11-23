package com.braintrust.education.domain.valueobjects;


import com.braintrust.shared.domain.ValueObject;
import java.util.*;

public class StudentGroupId extends ValueObject {
    private final String value;

    private StudentGroupId(String value) {
        this.value = Objects.requireNonNull(value, "StudentGroup ID cannot be null");
    }

    public static StudentGroupId generate() {
        return new StudentGroupId("GROUP-" + UUID.randomUUID());
    }

    public static StudentGroupId fromString(String value) {
        return new StudentGroupId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}