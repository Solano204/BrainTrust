package com.braintrust.education.domain.valueobjects;
import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class UnitId extends ValueObject {
    private final String value;

    private UnitId(String value) {
        this.value = Objects.requireNonNull(value, "Unit ID cannot be null");
    }

    public static UnitId generate() {
        return new UnitId("UNIT-" + UUID.randomUUID());
    }

    public static UnitId fromString(String value) {
        return new UnitId(value);
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