package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class QuizNotFoundException extends DomainException {
    public QuizNotFoundException(String message) {
        super(message, "QUIZ_NOT_FOUND");
    }
}