package com.braintrust.aidetectition.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;

public class AnalysisNotFoundException extends DomainException {
    public AnalysisNotFoundException(String message) {
        super(message, "COURSE_CODE_ALREADY_EXISTS");
    }

    public AnalysisNotFoundException(String message, Map<String, Object> details) {
        super(message, "COURSE_CODE_ALREADY_EXISTS", details);
    }
}