package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class GradebookNotFoundException extends DomainException {
    public GradebookNotFoundException(String message) {
        super(message, "GRADEBOOK_NOT_FOUND");
    }
}