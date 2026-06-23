package com.braintrust.shared.domain.exception;

public class EmailAlreadyExistsException extends DomainException {
    public EmailAlreadyExistsException(String email) {
        super("Email already registered: " + email, "EMAIL_ALREADY_EXISTS");
    }
}