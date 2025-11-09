package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

// 📍 identity/domain/valueobjects/Email.java - CORREGIDO
public class Email extends ValueObject {
    private final String value;

    public Email(String input) { // Usamos 'input' como nombre de parámetro

        // 1. Aplica limpieza y estandarización a la entrada
        String cleanedInput = (input == null) ? null : input.trim().toLowerCase();

        // 2. Valida el valor limpio y estandarizado
        validate(cleanedInput);

        // 3. Asigna el valor final limpio
        this.value = cleanedInput;
    }

    private void validate(String email) {
        // La validación ahora se ejecuta sobre el valor limpio (email)

        if (email == null || email.isEmpty()) { // Ya está limpio del trim/toLowerCase del constructor
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        // Ya que el valor ahora es estandarizado (limpio y minúsculas), la regex es correcta.
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!email.matches(emailRegex)) {
            throw new IllegalArgumentException("Invalid email format: " + email);
        }

        if (email.length() > 254) {
            throw new IllegalArgumentException("Email cannot exceed 254 characters");
        }
    }

    public String getValue() {
        return value;
    }

    @Override
    protected Object[] getEqualityComponents() {
        // La igualdad debe basarse en el valor limpio y estandarizado
        return new Object[]{value};
    }

    @Override
    public String toString() {
        return value;
    }
}