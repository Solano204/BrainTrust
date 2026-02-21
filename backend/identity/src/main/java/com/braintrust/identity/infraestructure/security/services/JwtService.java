package com.braintrust.identity.infraestructure.security.services;

import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.security.exception.JwtTokenException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service

public class JwtService {

    private static final Logger log =
            LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;


    @Value("${jwt.issuer}")
    private String issuer;

    private static final String AUTHORITIES_KEY = "authorities";
    private static final String USER_ID_KEY = "userId";
    private static final String TOKEN_TYPE_KEY = "tokenType";

    public String generateAccessToken(UserDetails userDetails, UserId userId) {
        Map<String, Object> extraClaims = new HashMap<>();

        extraClaims.put(AUTHORITIES_KEY, userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        extraClaims.put(USER_ID_KEY, userId.getValue());

        extraClaims.put(TOKEN_TYPE_KEY, "access_token");

        return buildToken(extraClaims, userDetails, accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails, UserId userId) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put(USER_ID_KEY, userId.getValue());
        extraClaims.put(TOKEN_TYPE_KEY, "refresh_token");

        return buildToken(extraClaims, userDetails, refreshTokenExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration) {

        Instant now = Instant.now();
        Instant expiryDate = now.plusMillis(expiration);

        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuer(issuer)
                .audience().add("braintrust-api").and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .notBefore(Date.from(now))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            final String tokenType = extractClaim(token, claims ->
                    claims.get(TOKEN_TYPE_KEY, String.class));

            return (username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && "access_token".equals(tokenType)
                    && isIssuerValid(token));

        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            final String tokenType = extractClaim(token, claims ->
                    claims.get(TOKEN_TYPE_KEY, String.class));

            return (username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && "refresh_token".equals(tokenType)
                    && isIssuerValid(token));

        } catch (Exception e) {
            log.error("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean isIssuerValid(String token) {
        String tokenIssuer = extractClaim(token, Claims::getIssuer);
        return issuer.equals(tokenIssuer);
    }

    // Extract Claims
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get(USER_ID_KEY, String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            throw new JwtTokenException("Token has expired", e);
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            throw new JwtTokenException("Unsupported token", e);
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw new JwtTokenException("Malformed token", e);
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            throw new JwtTokenException("Invalid signature", e);
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            throw new JwtTokenException("Token claims are empty", e);
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}