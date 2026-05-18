package com.braintrust.identity.domain.exceptions;


import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.shared.domain.exception.BusinessRuleException;

import java.util.Map;


public class EmailAlreadyExistsException extends BusinessRuleException {

    public EmailAlreadyExistsException(String message) {
        super(message, "EMAIL_ALREADY_EXISTS");
    }

    public EmailAlreadyExistsException(String message, Map<String, Object> details) {
        super(message, "EMAIL_ALREADY_EXISTS", details);
    }

    public static EmailAlreadyExistsException forEmail(Email email) {
        return (EmailAlreadyExistsException) new EmailAlreadyExistsException("Email already exists: " + email.getValue())
                .withDetail("email", email.getValue());
    }
}
