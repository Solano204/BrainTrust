package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

// Additional education exceptions you might need
public class CourseNotFoundException extends DomainException {
    public CourseNotFoundException(String message) {
        super(message, "COURSE_NOT_FOUND");
    }
}