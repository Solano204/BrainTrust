package com.braintrust.identity.domain.exceptions;


import com.braintrust.shared.domain.exception.ValidationException;

import java.util.Map;

// 📍 identity/domain/exceptions/InvalidPasswordException.java
public class InvalidPasswordException extends ValidationException {

    public InvalidPasswordException(String message) {
        super(message, "INVALID_PASSWORD");
    }

    public InvalidPasswordException(String message, Map<String, Object> details) {
        super(message, "INVALID_PASSWORD", details);
    }

    public static InvalidPasswordException weakPassword() {
        return (InvalidPasswordException) new InvalidPasswordException("Password must be at least 8 characters long")
                .withDetail("requirement", "MIN_LENGTH_8");
    }

    public static InvalidPasswordException incorrectCurrentPassword() {
        return (InvalidPasswordException) new InvalidPasswordException("Current password is incorrect")
                .withDetail("reason", "CURRENT_PASSWORD_MISMATCH");
    }
}