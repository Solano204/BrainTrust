package com.braintrust.identity.domain.exceptions;

/**
 * Se lanza cuando se intenta eliminar un usuario y se quiere informar
 * del vínculo existente con una persona (para mensajes de UI).
 */
public class UserHasLinkedPersonException extends RuntimeException {
    public UserHasLinkedPersonException(String message) {
        super(message);
    }
}