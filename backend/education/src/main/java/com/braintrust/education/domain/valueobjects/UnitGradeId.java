package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;
import java.util.*;
public class UnitGradeId extends ValueObject {
    private final String value;

    private UnitGradeId(String value) {
        this.value = Objects.requireNonNull(value, "UnitGrade ID cannot be null");
    }

    public static UnitGradeId generate() {
        return new UnitGradeId("UGRADE-" + UUID.randomUUID());
    }

    public static UnitGradeId fromString(String value) {
        return new UnitGradeId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}