package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;

public class StudentAlreadyEnrolledException extends DomainException {
    public StudentAlreadyEnrolledException(String message) {
        super(message, "STUDENT_ALREADY_ENROLLED");
    }

    public StudentAlreadyEnrolledException(String message, Map<String, Object> details) {
        super(message, "STUDENT_ALREADY_ENROLLED", details);
    }
}