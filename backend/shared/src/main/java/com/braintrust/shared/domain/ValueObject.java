package com.braintrust.shared.domain;

import java.io.Serializable;
import java.util.Arrays;

public abstract class ValueObject implements Serializable {

    protected abstract Object[] getEqualityComponents();

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        ValueObject other = (ValueObject) obj;
        return Arrays.equals(getEqualityComponents(), other.getEqualityComponents());
    }

    @Override
    public int hashCode() {
        return Arrays.hashCode(getEqualityComponents());
    }
}
