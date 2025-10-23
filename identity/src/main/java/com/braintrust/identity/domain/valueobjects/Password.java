package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Objects;

// 📍 identity/domain/valueobjects/Password.java
public class Password extends ValueObject {
    private final String hash;

    private Password(String hash) {
        this.hash = Objects.requireNonNull(hash, "Password hash cannot be null");
    }

    public static Password fromHash(String hash) {
        return new Password(hash);
    }

    public static Password create(String plainPassword, PasswordEncoder encoder) {
        if (plainPassword == null || plainPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        String hash = encoder.encode(plainPassword);
        return new Password(hash);
    }

    public boolean matches(String plainPassword, PasswordEncoder encoder) {
        return encoder.matches(plainPassword, hash);
    }

    public String getHash() {
        return hash;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{hash};
    }
}
