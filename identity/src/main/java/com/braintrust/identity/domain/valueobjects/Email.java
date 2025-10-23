package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

// 📍 identity/domain/valueobjects/Email.java
public class Email extends ValueObject {
    private final String value;

    public Email(String value) {
        validate(value);
        this.value = value.toLowerCase().trim();
    }

    private void validate(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!email.matches(emailRegex)) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }

        if (email.length() > 254) {
            throw new IllegalArgumentException("Email cannot exceed 254 characters");
        }
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