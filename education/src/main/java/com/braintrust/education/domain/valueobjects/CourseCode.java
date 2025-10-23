package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

// 📍 education/domain/valueobjects/CourseCode.java
public class CourseCode extends ValueObject {
    private final String value;

    public CourseCode(String value) {
        validate(value);
        this.value = value.toUpperCase().trim();
    }

    private void validate(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Course code cannot be null or empty");
        }
        if (!code.matches("[A-Z0-9-]+")) {
            throw new IllegalArgumentException("Course code can only contain letters, numbers and hyphens");
        }
        if (code.length() > 50) {
            throw new IllegalArgumentException("Course code cannot exceed 50 characters");
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
