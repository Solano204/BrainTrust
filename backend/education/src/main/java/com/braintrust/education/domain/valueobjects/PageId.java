package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public class PageId extends ValueObject {
    private final String value;

    private PageId(String value) {
        this.value = Objects.requireNonNull(value, "Page ID cannot be null");
    }

    public static PageId generate() {
        return new PageId("PAGE-" + UUID.randomUUID());
    }

    public static PageId fromString(String value) {
        return new PageId(value);
    }

    public String getValue() { return value; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}