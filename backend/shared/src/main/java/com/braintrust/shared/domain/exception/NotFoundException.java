package com.braintrust.shared.domain.exception;

import java.util.Map;

// 📍 shared/domain/exceptions/NotFoundException.java
public abstract class NotFoundException extends DomainException {

    protected NotFoundException(String message) {
        super(message);
    }

    protected NotFoundException(String message, String errorCode) {
        super(message, errorCode);
    }

    protected NotFoundException(String message, String errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }
}