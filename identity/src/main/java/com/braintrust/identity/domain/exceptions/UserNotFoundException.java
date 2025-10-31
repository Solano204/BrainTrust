package com.braintrust.identity.domain.exceptions;

import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;
// ⬅️ ADD THIS ANNOTATION
@ResponseStatus(HttpStatus.NOT_FOUND)
// 📍 identity/domain/exceptions/UserNotFoundException.java
public class UserNotFoundException extends NotFoundException {

    public UserNotFoundException(String message) {
        super(message, "USER_NOT_FOUND");
    }

    public UserNotFoundException(String message, Map<String, Object> details) {
        super(message, "USER_NOT_FOUND", details);
    }

    public static UserNotFoundException byId(UserId userId) {
        return (UserNotFoundException) new UserNotFoundException("User not found with ID: " + userId.getValue())
                .withDetail("userId", userId.getValue());
    }

    public static UserNotFoundException byEmail(Email email) {
        return (UserNotFoundException) new UserNotFoundException("User not found with email: " + email.getValue())
                .withDetail("email", email.getValue());
    }

    public static UserNotFoundException byPersonId(PersonId personId) {
        return (UserNotFoundException) new UserNotFoundException("User not found for person ID: " + personId.getValue())
                .withDetail("personId", personId.getValue());
    }
}