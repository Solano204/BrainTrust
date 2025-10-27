package com.braintrust.aidetectition.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

// 📍 aidetection/domain/valueobjects/AnalysisId.java
public class AnalysisId extends ValueObject {
    private final String value;

    private AnalysisId(String value) {
        this.value = Objects.requireNonNull(value, "Analysis ID cannot be null");
    }

    public static AnalysisId generate() {
        return new AnalysisId("ANALYSIS-" + UUID.randomUUID().toString());
    }

    public static AnalysisId fromString(String value) {
        return new AnalysisId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}