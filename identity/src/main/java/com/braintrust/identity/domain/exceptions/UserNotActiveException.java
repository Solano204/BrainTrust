package com.braintrust.identity.domain.exceptions;

import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.exception.BusinessRuleException;

import java.util.Map;

// 📍 identity/domain/exceptions/UserNotActiveException.java
public class UserNotActiveException extends BusinessRuleException {

    public UserNotActiveException(String message) {
        super(message, "USER_NOT_ACTIVE");
    }

    public UserNotActiveException(String message, Map<String, Object> details) {
        super(message, "USER_NOT_ACTIVE", details);
    }

    public static UserNotActiveException forUser(UserId userId) {
        return (UserNotActiveException) new UserNotActiveException("User account is not active: " + userId.getValue())
                .withDetail("userId", userId.getValue());
    }
}