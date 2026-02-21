package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

public class Score extends ValueObject {
    private final int value;
    private final int maxPoints;

    public Score(int value, int maxPoints) {
        validate(value, maxPoints);
        this.value = value;
        this.maxPoints = maxPoints;
    }

    private void validate(int value, int maxPoints) {
        if (value < 0) {
            throw new IllegalArgumentException("Score cannot be negative");
        }
        if (maxPoints <= 0) {
            throw new IllegalArgumentException("Max points must be positive");
        }
        if (value > maxPoints) {
            throw new IllegalArgumentException("Score cannot exceed max points");
        }
    }

    public int getValue() {
        return value;
    }

    public int getMaxPoints() {
        return maxPoints;
    }

    public double getPercentage() {
        return (double) value / maxPoints * 100;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value, maxPoints};
    }
}