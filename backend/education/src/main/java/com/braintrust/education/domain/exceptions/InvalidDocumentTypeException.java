package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;


public class InvalidDocumentTypeException extends DomainException {
    public InvalidDocumentTypeException(String message) {
        super(message, "ENROLLMENT_NOT_FOUND");
    }
}
