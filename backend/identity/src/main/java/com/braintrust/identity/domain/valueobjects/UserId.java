package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.UUID;

public class UserId extends ValueObject {
    private final String value;

    private UserId(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        this.value = value;
    }

    public static UserId generate() {
        return new UserId("USER-" + UUID.randomUUID().toString());
    }

    public static UserId fromString(String value) {
        return new UserId(value);
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