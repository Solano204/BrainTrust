package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class QuestionNotFoundException extends DomainException {
    public QuestionNotFoundException(String message) {
        super(message, "COURSE_NOT_FOUND");
    }
}