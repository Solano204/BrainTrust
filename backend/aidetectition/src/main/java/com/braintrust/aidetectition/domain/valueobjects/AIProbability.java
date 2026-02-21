package com.braintrust.aidetectition.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class AIProbability extends ValueObject {
    private final BigDecimal value;

    public AIProbability(BigDecimal value) {
        validate(value);
        this.value = value.setScale(4, RoundingMode.HALF_UP);
    }

    private void validate(BigDecimal value) {
        if (value == null) {
            throw new IllegalArgumentException("AI probability cannot be null");
        }
        if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("AI probability must be between 0 and 1");
        }
    }

    public BigDecimal getValue() {
        return value;
    }

    public BigDecimal getPercentage() {
        return value.multiply(BigDecimal.valueOf(100));
    }

    public boolean isLikelyAI() {
        return value.compareTo(new BigDecimal("0.7")) > 0; // 70% threshold
    }

    public boolean isUncertain() {
        return value.compareTo(new BigDecimal("0.3")) > 0 &&
                value.compareTo(new BigDecimal("0.7")) <= 0;
    }

    public boolean isLikelyHuman() {
        return value.compareTo(new BigDecimal("0.3")) <= 0;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}