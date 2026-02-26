package com.braintrust.identity.domain.exceptions;

public class CatalogInUseException extends RuntimeException {
    public CatalogInUseException(String message) {
        super(message);
    }
}