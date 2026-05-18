package com.braintrust.identity.infraestructure.security;

import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.ports.out.AuthenticationProvider;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.UserId;

// New and updated JJWT imports
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims; // Still used for the claim payload
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationProvider implements AuthenticationProvider {

    private final SecretKey key;
    private final Duration tokenValidity;
    private final String issuer = "BrainTrust-Platform"; // Best practice: use a fixed issuer

    public JwtAuthenticationProvider(
            @Value("${jwt.secret:my-secret-key-that-should-be-in-env-variables-minimum-256-bits-long}") String secret,
            @Value("${jwt.expiration.millis:86400000}") long expirationTimeMillis
    ) {

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenValidity = Duration.ofMillis(expirationTimeMillis);
    }

    @Override
    public AuthenticationResult authenticate(Email email, Password password) {

        throw new UnsupportedOperationException("Use UserApplicationService.authenticate");
    }

    @Override
    public void invalidateSession(UserId userId) {

    }

    @Override
    public String generateToken(User user) {
        Instant now = Instant.now();


        Map<String, Object> customClaims = new HashMap<>();
        customClaims.put("userId", user.getId().getValue());
        customClaims.put("email", user.getEmail().getValue());
        customClaims.put("role", user.getRole().name());
        customClaims.put("personId", user.getPersonId().getValue());

        return Jwts.builder()
                .header()
                .add("typ", "JWT")
                .and()
                .claims(customClaims)
                .subject(user.getId().getValue())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(tokenValidity)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}