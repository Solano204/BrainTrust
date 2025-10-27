package com.braintrust.shared.domain.exception;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

// 📍 shared/domain/exceptions/DomainException.java
public abstract class DomainException extends RuntimeException {

    private final String errorCode;
    private final Map<String, Object> details;

    protected DomainException(String message) {
        this(message, null, null);
    }

    protected DomainException(String message, String errorCode) {
        this(message, errorCode, null);
    }

    protected DomainException(String message, String errorCode, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode != null ? errorCode : this.getClass().getSimpleName();
        this.details = details != null ? new HashMap<>(details) : new HashMap<>();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return Collections.unmodifiableMap(details);
    }

    public DomainException withDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
}