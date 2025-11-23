package com.braintrust.education.domain.exceptions;

import com.braintrust.shared.domain.exception.DomainException;

public class PageNotFoundException extends DomainException {
    public PageNotFoundException(String message) {
        super(message, "PAGE_NOT_FOUND");
    }
}
