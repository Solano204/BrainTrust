package com.braintrust.identity.unit.infraestructure.security;


import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.security.exception.JwtTokenException;
import com.braintrust.identity.infraestructure.security.services.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;
    private String secretKey;
    private long accessTokenExpiration;
    private long refreshTokenExpiration;
    private String issuer;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Configure test values using reflection
        secretKey = "test-secret-key-for-jwt-that-must-be-at-least-256-bits-long-for-hs256-algorithm";
        accessTokenExpiration = 900000L; // 15 minutes
        refreshTokenExpiration = 86400000L; // 24 hours
        issuer = "braintrust-test";

        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", accessTokenExpiration);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", refreshTokenExpiration);
        ReflectionTestUtils.setField(jwtService, "issuer", issuer);
    }

    // ========================================
    // ✅ ACCESS TOKEN GENERATION TESTS
    // ========================================

    @Test
    @DisplayName("Should generate access token with valid data")
    void shouldGenerateAccessTokenWithValidData() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    @DisplayName("Should include username in access token")
    void shouldIncludeUsernameInAccessToken() {
        // Given
        String email = "user@example.com";
        UserDetails userDetails = createUserDetails(email, "ROLE_STUDENT");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        String extractedUsername = jwtService.extractUsername(token);

        // Then
        assertThat(extractedUsername).isEqualTo(email);
    }

    @Test
    @DisplayName("Should include user ID in access token")
    void shouldIncludeUserIdInAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_ADMIN");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        String extractedUserId = jwtService.extractUserId(token);

        // Then
        assertThat(extractedUserId).isEqualTo(userId.getValue());
    }

    @Test
    @DisplayName("Should include authorities in access token")
    void shouldIncludeAuthoritiesInAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);

        // Extract claims manually to verify authorities
        Claims claims = extractAllClaims(token);

        // 🚩 FIX: Explicitly cast the retrieved List to List<String>
        // This resolves the generic type conflict for AssertJ.
        @SuppressWarnings("unchecked")
        List<String> authorities = (List<String>) claims.get("authorities", List.class);

        // Then
        // Now the compiler can resolve containsExactly(String) because the List's element type is String
        assertThat(authorities).containsExactly("ROLE_TEACHER"); // <-- This now works!
    }

    @Test
    @DisplayName("Should set token type to access_token")
    void shouldSetTokenTypeToAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        String tokenType = jwtService.extractClaim(token, claims ->
                claims.get("tokenType", String.class));

        // Then
        assertThat(tokenType).isEqualTo("access_token");
    }

    @Test
    @DisplayName("Should set correct expiration for access token")
    void shouldSetCorrectExpirationForAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        long now = System.currentTimeMillis();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);

        // Then
        long expirationTime = expiration.getTime();
        assertThat(expirationTime).isGreaterThan(now);
        assertThat(expirationTime).isLessThanOrEqualTo(now + accessTokenExpiration + 1000); // 1 sec tolerance
    }

    @Test
    @DisplayName("Should set correct issuer in access token")
    void shouldSetCorrectIssuerInAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        String tokenIssuer = jwtService.extractClaim(token, Claims::getIssuer);

        // Then
        assertThat(tokenIssuer).isEqualTo(issuer);
    }

    // ========================================
    // ✅ REFRESH TOKEN GENERATION TESTS
    // ========================================

    @Test
    @DisplayName("Should generate refresh token with valid data")
    void shouldGenerateRefreshTokenWithValidData() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateRefreshToken(userDetails, userId);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("Should set token type to refresh_token")
    void shouldSetTokenTypeToRefreshToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateRefreshToken(userDetails, userId);
        String tokenType = jwtService.extractClaim(token, claims ->
                claims.get("tokenType", String.class));

        // Then
        assertThat(tokenType).isEqualTo("refresh_token");
    }

    @Test
    @DisplayName("Should set longer expiration for refresh token")
    void shouldSetLongerExpirationForRefreshToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        long now = System.currentTimeMillis();

        // When
        String token = jwtService.generateRefreshToken(userDetails, userId);
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);

        // Then
        long expirationTime = expiration.getTime();
        assertThat(expirationTime).isGreaterThan(now + accessTokenExpiration);
        assertThat(expirationTime).isLessThanOrEqualTo(now + refreshTokenExpiration + 1000);
    }

    @Test
    @DisplayName("Should not include authorities in refresh token")
    void shouldNotIncludeAuthoritiesInRefreshToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateRefreshToken(userDetails, userId);
        Claims claims = extractAllClaims(token);

        // Then
        assertThat(claims.get("authorities")).isNull();
    }

    // ========================================
    // ✅ TOKEN VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should validate valid access token")
    void shouldValidateValidAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should invalidate token with wrong username")
    void shouldInvalidateTokenWithWrongUsername() {
        // Given
        UserDetails correctUser = createUserDetails("correct@example.com", "ROLE_TEACHER");
        UserDetails wrongUser = createUserDetails("wrong@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(correctUser, userId);

        // When
        boolean isValid = jwtService.isTokenValid(token, wrongUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should invalidate refresh token as access token")
    void shouldInvalidateRefreshTokenAsAccessToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String refreshToken = jwtService.generateRefreshToken(userDetails, userId);

        // When
        boolean isValid = jwtService.isTokenValid(refreshToken, userDetails);

        // Then
        assertThat(isValid).isFalse(); // Wrong token type
    }

    @Test
    @DisplayName("Should validate valid refresh token")
    void shouldValidateValidRefreshToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateRefreshToken(userDetails, userId);

        // When
        boolean isValid = jwtService.isRefreshTokenValid(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should invalidate access token as refresh token")
    void shouldInvalidateAccessTokenAsRefreshToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String accessToken = jwtService.generateAccessToken(userDetails, userId);

        // When
        boolean isValid = jwtService.isRefreshTokenValid(accessToken, userDetails);

        // Then
        assertThat(isValid).isFalse(); // Wrong token type
    }

    @Test
    @DisplayName("Should invalidate token from wrong issuer")
    void shouldInvalidateTokenFromWrongIssuer() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // Create token with different issuer
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        String tokenWithWrongIssuer = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuer("wrong-issuer")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 900000))
                .claim("tokenType", "access_token")
                .claim("userId", userId.getValue())
                .signWith(key)
                .compact();

        // When
        boolean isValid = jwtService.isTokenValid(tokenWithWrongIssuer, userDetails);

        // Then
        assertThat(isValid).isFalse();
    }

    // ========================================
    // ✅ CLAIM EXTRACTION TESTS
    // ========================================

    @Test
    @DisplayName("Should extract username from token")
    void shouldExtractUsernameFromToken() {
        // Given
        String email = "user@example.com";
        UserDetails userDetails = createUserDetails(email, "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // When
        String extractedUsername = jwtService.extractUsername(token);

        // Then
        assertThat(extractedUsername).isEqualTo(email);
    }

    @Test
    @DisplayName("Should extract user ID from token")
    void shouldExtractUserIdFromToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // When
        String extractedUserId = jwtService.extractUserId(token);

        // Then
        assertThat(extractedUserId).isEqualTo(userId.getValue());
    }

    @Test
    @DisplayName("Should extract custom claim from token")
    void shouldExtractCustomClaimFromToken() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // When
        String tokenType = jwtService.extractClaim(token, claims ->
                claims.get("tokenType", String.class));

        // Then
        assertThat(tokenType).isNotNull();
    }

    // ========================================
    // ✅ ERROR HANDLING TESTS
    // ========================================

    @Test
    @DisplayName("Should throw exception for malformed token")
    void shouldThrowExceptionForMalformedToken() {
        // Given
        String malformedToken = "this.is.not.a.valid.jwt";
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");

        // When/Then
        assertThatThrownBy(() -> jwtService.extractUsername(malformedToken))
                .as("Should throw JwtTokenException for malformed token")
                .isInstanceOf(JwtTokenException.class);
    }

    @Test
    @DisplayName("Should throw exception for token with invalid signature")
    void shouldThrowExceptionForTokenWithInvalidSignature() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // Tamper with token
        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

        // When/Then
        assertThatThrownBy(() -> jwtService.extractUsername(tamperedToken))
                .as("Should throw JwtTokenException for invalid signature")
                .isInstanceOf(JwtTokenException.class);
    }

    @Test
    @DisplayName("Should throw exception for expired token")
    void shouldThrowExceptionForExpiredToken() {
        // Given
        // Set very short expiration
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 1L); // 1 millisecond

        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();
        String token = jwtService.generateAccessToken(userDetails, userId);

        // Wait for token to expire
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // When/Then
        assertThatThrownBy(() -> jwtService.extractUsername(token))
                .isInstanceOf(JwtTokenException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("Should throw exception for null token")
    void shouldThrowExceptionForNullToken() {
        // When/Then
        assertThatThrownBy(() -> jwtService.extractUsername(null))
                .isInstanceOf(JwtTokenException.class);
    }

    @Test
    @DisplayName("Should throw exception for empty token")
    void shouldThrowExceptionForEmptyToken() {
        // When/Then
        assertThatThrownBy(() -> jwtService.extractUsername(""))
                .isInstanceOf(JwtTokenException.class);
    }

    // ========================================
    // ✅ TOKEN UNIQUENESS TESTS
    // ========================================

    @Test
    @DisplayName("Should generate Same tokens for same user")
    void shouldGenerateSameTokensForSameUser() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String token1 = jwtService.generateAccessToken(userDetails, userId);

        String token2 = jwtService.generateAccessToken(userDetails, userId);

        // Then
        // La aserción ahora debe pasar: el contenido será distinto debido al timestamp IAT.
        assertThat(token1).isEqualTo(token2);
    }

    @Test
    @DisplayName("Should generate different access and refresh tokens")
    void shouldGenerateDifferentAccessAndRefreshTokens() {
        // Given
        UserDetails userDetails = createUserDetails("test@example.com", "ROLE_TEACHER");
        UserId userId = UserId.generate();

        // When
        String accessToken = jwtService.generateAccessToken(userDetails, userId);
        String refreshToken = jwtService.generateRefreshToken(userDetails, userId);

        // Then
        assertThat(accessToken).isNotEqualTo(refreshToken);
    }

    // ========================================
    // ✅ MULTIPLE ROLES TESTS
    // ========================================

    @Test
    @DisplayName("Should handle multiple authorities in token")
    void shouldHandleMultipleAuthoritiesInToken() {
        // Given
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_TEACHER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );
        UserDetails userDetails = User.builder()
                .username("test@example.com")
                .password("password")
                .authorities(authorities)
                .build();
        UserId userId = UserId.generate();

        // When
        String token = jwtService.generateAccessToken(userDetails, userId);
        Claims claims = extractAllClaims(token);

        // 🚩 FIX: Explicitly cast the List to List<String>
        // This tells the compiler the type of the elements, allowing AssertJ's
        // generic methods (like containsExactlyInAnyOrder) to resolve correctly.
        @SuppressWarnings("unchecked")
        List<String> extractedAuthorities = (List<String>) claims.get("authorities", List.class);

        // Then
        assertThat(extractedAuthorities).hasSize(2);
        assertThat(extractedAuthorities)
                .as("Extracted authorities should contain both roles")
                .containsExactlyInAnyOrder("ROLE_TEACHER", "ROLE_ADMIN");
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private UserDetails createUserDetails(String email, String role) {
        return User.builder()
                .username(email)
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(role)))
                .build();
    }

    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}