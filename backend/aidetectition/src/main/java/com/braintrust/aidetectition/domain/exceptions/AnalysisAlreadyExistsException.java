package com.braintrust.aidetectition.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;
public class AnalysisAlreadyExistsException extends DomainException {
    public AnalysisAlreadyExistsException(String message) {
        super(message, "COURSE_CODE_ALREADY_EXISTS");
    }

    public AnalysisAlreadyExistsException(String message, Map<String, Object> details) {
        super(message, "COURSE_CODE_ALREADY_EXISTS", details);
    }
}