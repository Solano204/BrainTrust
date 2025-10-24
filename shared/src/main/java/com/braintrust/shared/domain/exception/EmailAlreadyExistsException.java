package com.braintrust.shared.domain.exception;

// 📍 identity/domain/exceptions/EmailAlreadyExistsException.java
public class EmailAlreadyExistsException extends DomainException {
    public EmailAlreadyExistsException(String email) {
        super("Email already registered: " + email, "EMAIL_ALREADY_EXISTS");
    }
}