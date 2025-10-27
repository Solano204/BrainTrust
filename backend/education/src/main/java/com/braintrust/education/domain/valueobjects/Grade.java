package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;

// 📍 education/domain/valueobjects/Grade.java
public class Grade extends ValueObject {
    private final BigDecimal value;
    private final BigDecimal maxScore;

    public Grade(BigDecimal value, BigDecimal maxScore) {
        validate(value, maxScore);
        this.value = value.setScale(2, RoundingMode.HALF_UP);
        this.maxScore = maxScore.setScale(2, RoundingMode.HALF_UP);
    }

    private void validate(BigDecimal value, BigDecimal maxScore) {
        if (value == null || maxScore == null) {
            throw new IllegalArgumentException("Grade value and max score cannot be null");
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Grade cannot be negative");
        }
        if (maxScore.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Max score must be positive");
        }
        if (value.compareTo(maxScore) > 0) {
            throw new IllegalArgumentException("Grade cannot exceed max score");
        }
    }

    public BigDecimal getValue() {
        return value;
    }

    public BigDecimal getMaxScore() {
        return maxScore;
    }

    public BigDecimal getPercentage() {
        return value.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

    public boolean isPassing(BigDecimal passingGrade) {
        return getPercentage().compareTo(passingGrade) >= 0;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value, maxScore};
    }
}
