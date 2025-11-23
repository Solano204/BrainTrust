package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class GradebookAlreadyExistsException extends DomainException {
    public GradebookAlreadyExistsException(String message) {
        super(message, "GRADEBOOK_ALREADY_EXISTS");
    }
}