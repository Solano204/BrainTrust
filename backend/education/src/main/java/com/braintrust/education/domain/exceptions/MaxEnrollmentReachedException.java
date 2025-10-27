package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class MaxEnrollmentReachedException extends DomainException {
    public MaxEnrollmentReachedException(String message) {
        super(message, "MAX_ENROLLMENT_REACHED");
    }
}