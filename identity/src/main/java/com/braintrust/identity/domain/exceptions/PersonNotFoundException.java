package com.braintrust.identity.domain.exceptions;

import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.domain.exception.NotFoundException;

import java.util.Map;

// 📍 identity/domain/exceptions/PersonNotFoundException.java
public class PersonNotFoundException extends NotFoundException {

    public PersonNotFoundException(String message) {
        super(message, "PERSON_NOT_FOUND");
    }

    public PersonNotFoundException(String message, Map<String, Object> details) {
        super(message, "PERSON_NOT_FOUND", details);
    }

    public static PersonNotFoundException byId(PersonId personId) {
        return (PersonNotFoundException) new PersonNotFoundException("Person not found with ID: " + personId.getValue())
                .withDetail("personId", personId.getValue());
    }
}