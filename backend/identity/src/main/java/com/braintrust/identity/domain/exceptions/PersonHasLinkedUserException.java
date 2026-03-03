package com.braintrust.identity.domain.exceptions;

/**
 * Se lanza cuando se intenta eliminar una persona que tiene al menos
 * un usuario (cuenta) vinculado.
 */
public class PersonHasLinkedUserException extends RuntimeException {
    public PersonHasLinkedUserException(String message) {
        super(message);
    }
}

