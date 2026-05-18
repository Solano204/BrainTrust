package com.braintrust.education.domain.valueobjects;


import com.braintrust.shared.domain.ValueObject;
import java.util.*;


public class QuizSubmissionId extends ValueObject {
    private final String value;

    private QuizSubmissionId(String value) {
        this.value = Objects.requireNonNull(value, "QuizSubmission ID cannot be null");
    }

    public static QuizSubmissionId generate() {
        return new QuizSubmissionId("QSUBM-" + UUID.randomUUID());
    }

    public static QuizSubmissionId fromString(String value) {
        return new QuizSubmissionId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}