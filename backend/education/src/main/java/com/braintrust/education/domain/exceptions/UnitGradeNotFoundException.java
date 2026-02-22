package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class UnitGradeNotFoundException extends DomainException {
    public UnitGradeNotFoundException(String message) {
        super(message, "UNIT_GRADE_NOT_FOUND");
    }
}