package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class QuizQuestionId extends ValueObject {
    private final String value;

    private QuizQuestionId(String value) {
        this.value = Objects.requireNonNull(value, "QuizQuestion ID cannot be null");
    }

    public static QuizQuestionId generate() {
        return new QuizQuestionId("QQUES-" + UUID.randomUUID());
    }

    public static QuizQuestionId fromString(String value) {
        return new QuizQuestionId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}
