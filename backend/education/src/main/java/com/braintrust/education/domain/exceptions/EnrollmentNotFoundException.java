package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class EnrollmentNotFoundException extends DomainException {
    public EnrollmentNotFoundException(String message) {
        super(message, "ENROLLMENT_NOT_FOUND");
    }
}
