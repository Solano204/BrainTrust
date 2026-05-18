package com.braintrust.shared.domain.exception;


import java.util.Map;

// 📍 shared/domain/exceptions/BusinessRuleException.java
public abstract class BusinessRuleException extends DomainException {

    protected BusinessRuleException(String message) {
        super(message);
    }

    protected BusinessRuleException(String message, String errorCode) {
        super(message, errorCode);
    }

    protected BusinessRuleException(String message, String errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }
}