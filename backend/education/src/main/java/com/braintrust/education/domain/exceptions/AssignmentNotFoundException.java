package com.braintrust.education.domain.exceptions;


import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;

// Course-related exceptions
public class AssignmentNotFoundException extends DomainException {
    public AssignmentNotFoundException(String message) {
        super(message, "COURSE_CODE_ALREADY_EXISTS");
    }

    public AssignmentNotFoundException(String message, Map<String, Object> details) {
        super(message, "COURSE_CODE_ALREADY_EXISTS", details);
    }
}