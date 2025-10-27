package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

// 📍 identity/domain/valueobjects/PersonId.java
public class PersonId extends ValueObject {
    private final String value;

    private PersonId(String value) {
        this.value = Objects.requireNonNull(value, "Person ID cannot be null");
    }

    public static PersonId generate() {
        return new PersonId("PERSON-" + UUID.randomUUID().toString());
    }

    public static PersonId fromString(String value) {
        return new PersonId(value);
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{value};
    }
}