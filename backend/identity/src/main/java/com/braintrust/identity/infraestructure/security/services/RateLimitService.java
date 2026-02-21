package com.braintrust.identity.infraestructure.security.services;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final Logger log =
            LoggerFactory.getLogger(RateLimitService.class);


    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 60;

    public boolean allowRequest(String clientIdentifier) {
        if (clientIdentifier == null || clientIdentifier.trim().isEmpty()) {
            log.warn("Rate limit check skipped: Client identifier is null or empty.");
            return true;
        }

        RateLimitBucket bucket = buckets.computeIfAbsent(
                clientIdentifier,
                k -> new RateLimitBucket()
        );

        return bucket.allowRequest();
    }

    @Scheduled(fixedRate = 3600000)
    public void cleanupInactiveBuckets() {
        int removedBuckets = 0;
        Instant cutoffTime = Instant.now().minus(Duration.ofHours(1));

        buckets.entrySet().removeIf(entry -> {
            boolean inactive = entry.getValue().isInactive(cutoffTime);
            if (inactive) ;
            return inactive;
        });

        if (removedBuckets > 0) {
            log.info("Cleaned up {} inactive rate limit buckets", removedBuckets);
        }
    }

    public int getActiveBuckets() {
        return buckets.size();
    }

    private static class RateLimitBucket {
        private double tokens;
        private Instant lastRefill;
        private Instant lastAccess;

        public RateLimitBucket() {
            this.tokens = MAX_REQUESTS_PER_MINUTE;
            this.lastRefill = Instant.now();
            this.lastAccess = Instant.now();
        }

        public synchronized boolean allowRequest() {
            refill();
            lastAccess = Instant.now();

            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }

            return false;
        }

        private void refill() {
            Instant now = Instant.now();
            Duration timePassed = Duration.between(lastRefill, now);
            double secondsPassed = timePassed.toMillis() / 1000.0;

            double tokensPerSecond = MAX_REQUESTS_PER_MINUTE / 60.0;
            double tokensToAdd = secondsPassed * tokensPerSecond;

            if (tokensToAdd > 0) {
                tokens = Math.min(MAX_REQUESTS_PER_MINUTE, tokens + tokensToAdd);
                lastRefill = now;
            }
        }

        public boolean isInactive(Instant cutoffTime) {
            return lastAccess.isBefore(cutoffTime);
        }
    }
}