package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

// 📍 education/domain/valueobjects/CourseId.java
public class CourseId extends ValueObject {
    private final String value;

    private CourseId(String value) {
        this.value = Objects.requireNonNull(value, "Course ID cannot be null");
    }

    public static CourseId generate() {
        return new CourseId("COURSE-" + UUID.randomUUID().toString());
    }

    public static CourseId fromString(String value) {
        return new CourseId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}