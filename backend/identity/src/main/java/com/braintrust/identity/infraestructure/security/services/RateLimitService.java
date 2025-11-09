package com.braintrust.identity.infraestructure.security.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


// refill() se ejecuta en cada petición and when is enoighhht time
// A map for all users (Obvuius)
// i break the rateLimiter ( the majority the time pass on second example to spam of 61 request that wont allow the refill to compasate the bucker will be get bliocked)
@Service
@Slf4j
public class RateLimitService {


    // Here im usin the ConcurrentMap ("To handle the request in paralale without they step on each other")
    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 60;

    public boolean allowRequest(String clientIdentifier) {
// ✅ CORRECCIÓN CLAVE: Interceptar null o vacío para manejarlo elegantemente.
        if (clientIdentifier == null || clientIdentifier.trim().isEmpty()) {
            log.warn("Rate limit check skipped: Client identifier is null or empty.");
            // Permitimos el request ya que no podemos rate-limitar a un cliente sin ID.
            return true;
        }
        /*
        // Primera petición de juan@mail.com:
clientIdentifier = "user:juan@mail.com"

// buckets está vacío: {}
RateLimitBucket bucket = buckets.computeIfAbsent(
    "user:juan@mail.com",
    k -> new RateLimitBucket()  // Esta función se ejecuta
);
// Ahora buckets = {"user:juan@mail.com" → RateLimitBucket(tokens:60)}

// Segunda petición de juan@mail.com:
RateLimitBucket bucket = buckets.computeIfAbsent(
    "user:juan@mail.com",
    k -> new RateLimitBucket()  // Esta función NO se ejecuta
);
// Retorna el bucket existente (tokens:59)

        *
        */
        RateLimitBucket bucket = buckets.computeIfAbsent(
                clientIdentifier,
                k -> new RateLimitBucket()
        );

        return bucket.allowRequest();
    }

    /**
     * Limpia buckets inactivos cada hora para prevenir memory leaks.
     * Se ejecuta automáticamente en segundo plano.
     */
    @Scheduled(fixedRate = 3600000) // 1 hora en milisegundos
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

    /**
     * Obtiene estadísticas de uso (útil para debugging)
     */
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

        /**
         * Recarga tokens de forma suave (1 token por segundo)
         * en vez de 60 tokens instantáneos cada minuto.
         */
        private void refill() {
            Instant now = Instant.now();
            Duration timePassed = Duration.between(lastRefill, now);
            double secondsPassed = timePassed.toMillis() / 1000.0;

            // Recarga suave: 1 token por segundo (60 tokens/minuto)
            double tokensPerSecond = MAX_REQUESTS_PER_MINUTE / 60.0;
            double tokensToAdd = secondsPassed * tokensPerSecond;

            // add when is enought time
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