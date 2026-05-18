package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

import java.util.Map;

public class UnitNotFoundException extends DomainException {
    public UnitNotFoundException(String message) {
        super(message, "UNIT_NOT_FOUND");
    }

    public UnitNotFoundException(String message, Map<String, Object> details) {
        super(message, "UNIT_NOT_FOUND", details);
    }
}