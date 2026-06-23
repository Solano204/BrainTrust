package com.braintrust.containerapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("virtualThreads")
public class VirtualThreadHealthIndicator implements HealthIndicator {

    private static final Logger log = LoggerFactory.getLogger(VirtualThreadHealthIndicator.class);

    private static final long WARNING_THRESHOLD = 50_000;
    private static final long CRITICAL_THRESHOLD = 100_000;
    private static final long EXPECTED_MIN_RATIO = 10;

    @Override
    public Health health() {
        try {
            long activeVThreads = countActiveVirtualThreads();
            long carrierThreads = countCarrierThreads();
            long platformThreads = countPlatformThreads();

            Health.Builder builder = Health.up();
            builder.withDetail("activeVirtualThreads", activeVThreads);
            builder.withDetail("carrierThreads", carrierThreads);
            builder.withDetail("platformThreads", platformThreads);

            if (carrierThreads > 0) {
                long ratio = activeVThreads / carrierThreads;
                builder.withDetail("virtualThreadsPerCarrier", ratio);
                if (ratio < EXPECTED_MIN_RATIO) {
                    builder.withDetail("warning", "Low VT/Carrier ratio - may not be benefiting from Virtual Threads");
                    log.warn("Low Virtual Thread utilization: activeVT={} carriers={} ratio={}", activeVThreads, carrierThreads, ratio);
                }
            }

            if (activeVThreads > CRITICAL_THRESHOLD) {
                builder.status("DOWN");
                builder.withDetail("error", "CRITICAL: Too many active Virtual Threads (" + activeVThreads + ")");
                log.error("CRITICAL: activeVT={} exceeds threshold={}", activeVThreads, CRITICAL_THRESHOLD);
            } else if (activeVThreads > WARNING_THRESHOLD) {
                builder.status("WARNING");
                builder.withDetail("warning", "High number of active Virtual Threads (" + activeVThreads + ")");
                log.warn("WARNING: activeVT={} exceeds warning threshold={}", activeVThreads, WARNING_THRESHOLD);
            }

            log.debug("Virtual thread health: activeVT={} carriers={} platform={}", activeVThreads, carrierThreads, platformThreads);

            return builder.build();

        } catch (Exception e) {
            log.error("Error checking Virtual Thread health", e);
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }

    private long countActiveVirtualThreads() {
        return Thread.getAllStackTraces().keySet().stream()
                .filter(Thread::isVirtual)
                .filter(Thread::isAlive)
                .count();
    }

    private long countCarrierThreads() {
        return Thread.getAllStackTraces().keySet().stream()
                .filter(t -> !t.isVirtual())
                .filter(t -> t.getName().contains("ForkJoinPool") || t.getName().contains("http-"))
                .count();
    }

    private long countPlatformThreads() {
        return Thread.getAllStackTraces().keySet().stream()
                .filter(t -> !t.isVirtual())
                .count();
    }
}
