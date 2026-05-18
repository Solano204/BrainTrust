package com.braintrust.identity.domain.exceptions;

import com.braintrust.shared.domain.exception.BusinessRuleException;

import java.util.Map;


public class InvalidCredentialsException extends BusinessRuleException {

    public InvalidCredentialsException(String message) {
        super(message, "INVALID_CREDENTIALS");
    }

    public InvalidCredentialsException(String message, Map<String, Object> details) {
        super(message, "INVALID_CREDENTIALS", details);
    }

    public static InvalidCredentialsException invalidEmailOrPassword() {
        return (InvalidCredentialsException) new InvalidCredentialsException("Invalid email or password")
                .withDetail("reason", "EMAIL_OR_PASSWORD_INVALID");
    }

    public static InvalidCredentialsException accountInactive() {
        return (InvalidCredentialsException) new InvalidCredentialsException("Account is inactive")
                .withDetail("reason", "ACCOUNT_INACTIVE");
    }
}