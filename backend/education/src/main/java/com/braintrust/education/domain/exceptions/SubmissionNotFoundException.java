package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;


public class SubmissionNotFoundException extends DomainException {
    public SubmissionNotFoundException(String message) {
        super(message, "ENROLLMENT_NOT_FOUND");
    }
}

