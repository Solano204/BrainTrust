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
            // Key must be long enough (256 bits for HS256 = 32 chars)
            @Value("${jwt.secret:my-secret-key-that-should-be-in-env-variables-minimum-256-bits-long}") String secret,
            // Using Duration for clarity (86400000ms = 24 hours)
            @Value("${jwt.expiration.millis:86400000}") long expirationTimeMillis
    ) {
        // Use Keys.hmacShaKeyFor for modern key creation
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenValidity = Duration.ofMillis(expirationTimeMillis);
    }

    @Override
    public AuthenticationResult authenticate(Email email, Password password) {
        // This method remains unsupported as authentication logic is outside the token provider.
        throw new UnsupportedOperationException("Use UserApplicationService.authenticate");
    }

    @Override
    public void invalidateSession(UserId userId) {
        // In a stateless JWT approach, we don't invalidate tokens
        // (Blacklisting/Revocation logic would go here if implemented)
    }

    @Override
    public String generateToken(User user) {
        Instant now = Instant.now();

        // 1. New way to build claims using Jwts.claims()
        Map<String, Object> customClaims = new HashMap<>();
        customClaims.put("userId", user.getId().getValue());
        customClaims.put("email", user.getEmail().getValue());
        customClaims.put("role", user.getRole().name());
        customClaims.put("personId", user.getPersonId().getValue());

        // 2. Use the modern Jwts.builder() structure
        return Jwts.builder()
                .header()
                .add("typ", "JWT") // Add standard JWT header
                .and()
                .claims(customClaims) // Add all custom claims in one go
                .subject(user.getId().getValue()) // Set Subject (user ID)
                .issuer(issuer)
                .issuedAt(Date.from(now)) // Set Issued At time
                .expiration(Date.from(now.plus(tokenValidity))) // Set Expiration time
                .signWith(key, Jwts.SIG.HS256) // Use Jwts.SIG constants (modern way)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        // 1. The parser setup is updated to use modern Jwts.parser()
        Claims claims = Jwts.parser()
                .verifyWith(key) // New, cleaner method for setting the signing key
                .build()
                .parseSignedClaims(token) // New method replaces parseClaimsJws
                .getPayload();

        // claims.getSubject() is still the correct way to get the primary user ID
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            // The validation is clean, using the modern parser structure
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Catches signature mismatch, expiration errors (ExpiredJwtException), etc.
            return false;
        }
    }
}