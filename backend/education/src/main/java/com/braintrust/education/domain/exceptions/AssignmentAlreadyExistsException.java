package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class  AssignmentAlreadyExistsException extends DomainException {
    public AssignmentAlreadyExistsException(String message) {
        super(message, "ASSIGNMENT_ALREADY_EXISTS");
    }
}