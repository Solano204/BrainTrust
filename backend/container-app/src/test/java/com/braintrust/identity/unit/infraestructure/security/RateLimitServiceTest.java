package com.braintrust.identity.unit.infraestructure.security;


import com.braintrust.identity.infraestructure.security.services.RateLimitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("RateLimitService Unit Tests")
class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        rateLimitService = new RateLimitService();
    }

    // ========================================
    // ✅ BASIC RATE LIMITING TESTS
    // ========================================

    @Test
    @DisplayName("Should allow first request")
    void shouldAllowFirstRequest() {
        // Given
        String clientId = "user:test@example.com";

        // When
        boolean allowed = rateLimitService.allowRequest(clientId);

        // Then
        assertThat(allowed).isTrue();
    }

    @Test
    @DisplayName("Should allow multiple requests within limit")
    void shouldAllowMultipleRequestsWithinLimit() {
        // Given
        String clientId = "user:test@example.com";

        // When/Then
        for (int i = 0; i < 50; i++) {
            boolean allowed = rateLimitService.allowRequest(clientId);
            assertThat(allowed).isTrue();
        }
    }

    @Test
    @DisplayName("Should block requests after exceeding limit")
    void shouldBlockRequestsAfterExceedingLimit() {
        // Given
        String clientId = "user:test@example.com";

        // When - Use all 60 tokens
        for (int i = 0; i < 60; i++) {
            rateLimitService.allowRequest(clientId);
        }

        // Then - Next request should be blocked
        boolean allowed = rateLimitService.allowRequest(clientId);
        assertThat(allowed).isFalse();
    }

    @Test
    @DisplayName("Should block multiple requests after exceeding limit")
    void shouldBlockMultipleRequestsAfterExceedingLimit() {
        // Given
        String clientId = "user:test@example.com";

        // When - Exhaust all tokens
        for (int i = 0; i < 60; i++) {
            rateLimitService.allowRequest(clientId);
        }

        // Then - Multiple subsequent requests should be blocked
        for (int i = 0; i < 10; i++) {
            boolean allowed = rateLimitService.allowRequest(clientId);
            assertThat(allowed).isFalse();
        }
    }

    // ========================================
    // ✅ BUCKET REFILL TESTS
    // ========================================

    @Test
    @DisplayName("Should refill tokens over time")
    void shouldRefillTokensOverTime() throws InterruptedException {
        // Given
        String clientId = "user:test@example.com";

        // When - Use all tokens
        for (int i = 0; i < 60; i++) {
            rateLimitService.allowRequest(clientId);
        }

        // Verify bucket is empty
        assertThat(rateLimitService.allowRequest(clientId)).isFalse();

        // Wait for 2 seconds (should refill ~2 tokens at 1 token/second)
        Thread.sleep(2000);

        // Then - Should have tokens again
        boolean allowed1 = rateLimitService.allowRequest(clientId);
        boolean allowed2 = rateLimitService.allowRequest(clientId);
        boolean blocked = rateLimitService.allowRequest(clientId);

        assertThat(allowed1).isTrue();
        assertThat(allowed2).isTrue();
        assertThat(blocked).isFalse(); // Should still be blocked after using refilled tokens
    }

    @Test
    @DisplayName("Should gradually refill tokens")
    void shouldGraduallyRefillTokens() throws InterruptedException {
        // Given
        String clientId = "user:test@example.com";

        // When - Use some tokens
        for (int i = 0; i < 30; i++) {
            rateLimitService.allowRequest(clientId);
        }

        // Wait for 1 second
        Thread.sleep(1000);

        // Then - Should have refilled approximately 1 token
        // So we should be able to make 31 more requests (30 remaining + 1 refilled)
        int successfulRequests = 0;
        for (int i = 0; i < 35; i++) {
            if (rateLimitService.allowRequest(clientId)) {
                successfulRequests++;
            }
        }

        // Should allow around 31 requests (30 + 1 refilled)
        assertThat(successfulRequests).isBetween(30, 32);
    }

    @Test
    @DisplayName("Should not exceed max tokens after refill")
    void shouldNotExceedMaxTokensAfterRefill() throws InterruptedException {
        // Given
        String clientId = "user:test@example.com";

        // Use only 10 tokens
        for (int i = 0; i < 10; i++) {
            rateLimitService.allowRequest(clientId);
        }

        // Wait for 60 seconds (should fully refill)
        Thread.sleep(60000);

        // Then - Should not exceed 60 tokens (initial max)
        int successfulRequests = 0;
        for (int i = 0; i < 65; i++) {
            if (rateLimitService.allowRequest(clientId)) {
                successfulRequests++;
            }
        }

        assertThat(successfulRequests).isEqualTo(60);
    }

    // ========================================
    // ✅ MULTIPLE CLIENTS TESTS
    // ========================================

    @Test
    @DisplayName("Should isolate rate limits between different clients")
    void shouldIsolateRateLimitsBetweenDifferentClients() {
        // Given
        String client1 = "user:user1@example.com";
        String client2 = "user:user2@example.com";

        // When - Exhaust client1's tokens
        for (int i = 0; i < 60; i++) {
            rateLimitService.allowRequest(client1);
        }

        // Then - Client1 should be blocked, but client2 should not
        assertThat(rateLimitService.allowRequest(client1)).isFalse();
        assertThat(rateLimitService.allowRequest(client2)).isTrue();
    }

    @Test
    @DisplayName("Should track multiple clients independently")
    void shouldTrackMultipleClientsIndependently() {
        // Given
        String client1 = "user:user1@example.com";
        String client2 = "user:user2@example.com";
        String client3 = "ip:192.168.1.1";

        // When - Use different amounts for each client
        for (int i = 0; i < 30; i++) {
            rateLimitService.allowRequest(client1);
        }
        for (int i = 0; i < 50; i++) {
            rateLimitService.allowRequest(client2);
        }
        for (int i = 0; i < 10; i++) {
            rateLimitService.allowRequest(client3);
        }

        // Then - Each should have different remaining tokens
        // Client1: ~30 remaining
        // Client2: ~10 remaining
        // Client3: ~50 remaining
        int client1Remaining = countRemainingTokens(client1);
        int client2Remaining = countRemainingTokens(client2);
        int client3Remaining = countRemainingTokens(client3);

        assertThat(client1Remaining).isBetween(28, 32);
        assertThat(client2Remaining).isBetween(8, 12);
        assertThat(client3Remaining).isBetween(48, 52);
    }

    // ========================================
    // ✅ CLIENT IDENTIFIER TESTS
    // ========================================

    @Test
    @DisplayName("Should handle user-based identifiers")
    void shouldHandleUserBasedIdentifiers() {
        // Given
        String userIdentifier = "user:john@example.com";

        // When
        boolean allowed = rateLimitService.allowRequest(userIdentifier);

        // Then
        assertThat(allowed).isTrue();
    }

    @Test
    @DisplayName("Should handle IP-based identifiers")
    void shouldHandleIpBasedIdentifiers() {
        // Given
        String ipIdentifier = "ip:192.168.1.100";

        // When
        boolean allowed = rateLimitService.allowRequest(ipIdentifier);

        // Then
        assertThat(allowed).isTrue();
    }

    @Test
    @DisplayName("Should treat different identifier formats as separate clients")
    void shouldTreatDifferentIdentifierFormatsAsSeparateClients() {
        // Given
        String userIdentifier = "user:test@example.com";
        String ipIdentifier = "ip:192.168.1.1";

        // When - Exhaust user identifier
        for (int i = 0; i < 60; i++) {
            rateLimitService.allowRequest(userIdentifier);
        }

        // Then - User should be blocked, IP should not
        assertThat(rateLimitService.allowRequest(userIdentifier)).isFalse();
        assertThat(rateLimitService.allowRequest(ipIdentifier)).isTrue();
    }

    // ========================================
    // ✅ STATISTICS TESTS
    // ========================================

    @Test
    @DisplayName("Should track active buckets")
    void shouldTrackActiveBuckets() {
        // Given
        String client1 = "user:user1@example.com";
        String client2 = "user:user2@example.com";
        String client3 = "ip:192.168.1.1";

        // When
        rateLimitService.allowRequest(client1);
        rateLimitService.allowRequest(client2);
        rateLimitService.allowRequest(client3);

        // Then
        int activeBuckets = rateLimitService.getActiveBuckets();
        assertThat(activeBuckets).isEqualTo(3);
    }

    @Test
    @DisplayName("Should not create duplicate buckets for same client")
    void shouldNotCreateDuplicateBucketsForSameClient() {
        // Given
        String clientId = "user:test@example.com";

        // When
        rateLimitService.allowRequest(clientId);
        rateLimitService.allowRequest(clientId);
        rateLimitService.allowRequest(clientId);

        // Then
        int activeBuckets = rateLimitService.getActiveBuckets();
        assertThat(activeBuckets).isEqualTo(1);
    }

    @Test
    @DisplayName("Should increment active buckets for new clients")
    void shouldIncrementActiveBucketsForNewClients() {
        // Given
        int initialBuckets = rateLimitService.getActiveBuckets();

        // When
        rateLimitService.allowRequest("user:user1@example.com");
        int afterFirst = rateLimitService.getActiveBuckets();

        rateLimitService.allowRequest("user:user2@example.com");
        int afterSecond = rateLimitService.getActiveBuckets();

        // Then
        assertThat(afterFirst).isEqualTo(initialBuckets + 1);
        assertThat(afterSecond).isEqualTo(initialBuckets + 2);
    }

    // ========================================
    // ✅ EDGE CASES TESTS
    // ========================================

    @Test
    @DisplayName("Should handle rapid successive requests")
    void shouldHandleRapidSuccessiveRequests() {
        // Given
        String clientId = "user:test@example.com";

        // When - Make 100 rapid requests
        int allowedCount = 0;
        for (int i = 0; i < 100; i++) {
            if (rateLimitService.allowRequest(clientId)) {
                allowedCount++;
            }
        }

        // Then - Should allow exactly 60 requests
        assertThat(allowedCount).isEqualTo(60);
    }

    @Test
    @DisplayName("Should handle empty client identifier")
    void shouldHandleEmptyClientIdentifier() {
        // Given
        String emptyId = "";

        // When
        boolean allowed = rateLimitService.allowRequest(emptyId);

        // Then - Should still work (treats as separate client)
        assertThat(allowed).isTrue();
    }

    @Test
    @DisplayName("Should handle null client identifier gracefully")
    void shouldHandleNullClientIdentifierGracefully() {
        // Given
        String nullId = null;

        // When/Then - Should not throw exception
        assertThatCode(() -> rateLimitService.allowRequest(nullId))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should handle very long client identifiers")
    void shouldHandleVeryLongClientIdentifiers() {
        // Given
        String longId = "user:" + "a".repeat(1000) + "@example.com";

        // When
        boolean allowed = rateLimitService.allowRequest(longId);

        // Then
        assertThat(allowed).isTrue();
    }

    @Test
    @DisplayName("Should handle special characters in identifiers")
    void shouldHandleSpecialCharactersInIdentifiers() {
        // Given
        String specialId = "user:test+tag@example.com";

        // When
        boolean allowed = rateLimitService.allowRequest(specialId);

        // Then
        assertThat(allowed).isTrue();
    }

    // ========================================
    // ✅ CONCURRENT ACCESS TESTS (Basic)
    // ========================================

    @Test
    @DisplayName("Should handle concurrent requests from same client")
    void shouldHandleConcurrentRequestsFromSameClient() throws InterruptedException {
        // Given
        String clientId = "user:test@example.com";
        int threadCount = 10;
        int requestsPerThread = 10;

        // When - Make concurrent requests
        Thread[] threads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < requestsPerThread; j++) {
                    rateLimitService.allowRequest(clientId);
                }
            });
            threads[i].start();
        }

        // Wait for all threads to complete
        for (Thread thread : threads) {
            thread.join();
        }

        // Then - Should have processed all requests consistently
        // Total requests = 100, should allow exactly 60
        int remainingAllowed = countRemainingTokens(clientId);
        assertThat(remainingAllowed).isEqualTo(0); // All 60 should be used
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private int countRemainingTokens(String clientId) {
        int count = 0;
        while (rateLimitService.allowRequest(clientId)) {
            count++;
            if (count > 100) break; // Safety limit
        }
        return count;
    }
}