package com.braintrust.education.infraestructure.security;


import com.braintrust.identity.application.ports.out.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SpringSecurityPasswordEncoder implements PasswordEncoder {

    private final BCryptPasswordEncoder encoder;

    public SpringSecurityPasswordEncoder() {
        this.encoder = new BCryptPasswordEncoder(12);
    }

    @Override
    public String encode(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    @Override
    public boolean matches(String plainPassword, String encodedPassword) {
        return encoder.matches(plainPassword, encodedPassword);
    }
}