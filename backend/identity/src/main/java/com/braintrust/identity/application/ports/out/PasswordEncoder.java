package com.braintrust.identity.application.ports.out;


public interface PasswordEncoder {
    String encode(String plainPassword);
    boolean matches(String plainPassword, String encodedPassword);
}