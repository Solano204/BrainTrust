package com.braintrust.identity.application.ports.out;

// 📍 identity/application/ports/out/PasswordEncoder.java
public interface PasswordEncoder {
    String encode(String plainPassword);
    boolean matches(String plainPassword, String encodedPassword);
}