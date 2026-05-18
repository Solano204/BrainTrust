package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class QuizId extends ValueObject {
    private final String value;

    private QuizId(String value) {
        this.value = Objects.requireNonNull(value, "Quiz ID cannot be null");
    }

    public static QuizId generate() {
        return new QuizId("QUIZ-" + UUID.randomUUID());
    }

    public static QuizId fromString(String value) {
        return new QuizId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}