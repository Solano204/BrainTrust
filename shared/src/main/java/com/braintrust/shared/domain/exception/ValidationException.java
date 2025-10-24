package com.braintrust.shared.domain.exception;

import java.util.Map;

// 📍 shared/domain/exceptions/ValidationException.java
public abstract class ValidationException extends DomainException {

    protected ValidationException(String message) {
        super(message);
    }

    protected ValidationException(String message, String errorCode) {
        super(message, errorCode);
    }

    protected ValidationException(String message, String errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }
}