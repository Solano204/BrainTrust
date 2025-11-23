package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class StudentGroupNotFoundException extends DomainException {
    public StudentGroupNotFoundException(String message) {
        super(message, "STUDENT_GROUP_NOT_FOUND");
    }
}
