package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;


public class CourseCodeAlreadyExistsException extends DomainException {
    public CourseCodeAlreadyExistsException(String message) {
        super(message, "COURSE_CODE_ALREADY_EXISTS");
    }

    public CourseCodeAlreadyExistsException(String message, Map<String, Object> details) {
        super(message, "COURSE_CODE_ALREADY_EXISTS", details);
    }
}