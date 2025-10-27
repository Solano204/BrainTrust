package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class CourseNotActiveException extends DomainException {
    public CourseNotActiveException(String message) {
        super(message, "COURSE_NOT_ACTIVE");
    }
}
