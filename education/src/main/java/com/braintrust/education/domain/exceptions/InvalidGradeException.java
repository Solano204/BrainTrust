package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class InvalidGradeException extends DomainException {
    public InvalidGradeException(String message) {
        super(message, "INVALID_GRADE");
    }
}