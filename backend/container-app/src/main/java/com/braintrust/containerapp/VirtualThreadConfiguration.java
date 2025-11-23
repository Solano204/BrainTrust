package com.braintrust.containerapp;


import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.Connector;
import org.apache.coyote.ProtocolHandler;
import org.springframework.boot.web.embedded.tomcat.TomcatProtocolHandlerCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * ✅ PRODUCTION-READY Virtual Threads Configuration
 *
 * This configuration uses ONLY stable APIs (FINAL since Java 21):
 * - Virtual Threads via Executors.newVirtualThreadPerTaskExecutor()
 * - Tomcat integration with Virtual Threads
 * - @Async support with Virtual Threads
 *
 * Benefits:
 * - 50-100x more concurrent requests
 * - Reduced memory usage
 * - Simple, blocking code style
 * - No breaking changes risk
 *
 * @author BrainTrust Team
 * @since Java 21
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class VirtualThreadConfiguration {

    private static final Logger log =
            LoggerFactory.getLogger(VirtualThreadConfiguration.class);

    /**
     * ✅ EXECUTOR FOR @Async METHODS
     *
     * This executor is used for all methods annotated with @Async.
     * Each async task gets its own Virtual Thread.
     *
     * Example usage:
     * @Async("virtualTaskExecutor")
     * public void sendNotification() { ... }
     */
    @Bean(name = "virtualTaskExecutor")
    public Executor virtualTaskExecutor() {
        log.info("🚀 Initializing Virtual Thread Executor for @Async operations");
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * ✅ CONFIGURE TOMCAT TO USE VIRTUAL THREADS
     *
     * CRITICAL: This makes ALL HTTP requests execute on Virtual Threads.
     * Every incoming request gets its own lightweight Virtual Thread.
     *
     * This is the most important configuration for web applications.
     */
    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutor() {
        return protocolHandler -> {
            log.info("🔧 Configuring Tomcat to use Virtual Threads for HTTP requests");
            protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        };
    }

    /**
     * ✅ OPTIONAL: Fine-tune Tomcat for high throughput
     *
     * These settings optimize Tomcat for Virtual Threads workloads.
     */
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatOptimization() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                ProtocolHandler handler = connector.getProtocolHandler();

                // Set connection timeout
                if (handler instanceof org.apache.coyote.http11.AbstractHttp11Protocol) {
                    org.apache.coyote.http11.AbstractHttp11Protocol<?> protocol =
                            (org.apache.coyote.http11.AbstractHttp11Protocol<?>) handler;

                    protocol.setConnectionTimeout(60000);  // 60 seconds
                    protocol.setKeepAliveTimeout(60000);
                    protocol.setMaxKeepAliveRequests(100);

                    log.info("✅ Tomcat connector optimized for Virtual Threads");
                }
            });
        };
    }

    /**
     * ✅ HEALTH INDICATOR FOR MONITORING
     *
     * Exposes Virtual Thread metrics via /actuator/health/virtualThreads
     */
    @Bean
    public VirtualThreadHealthIndicator virtualThreadHealthIndicator() {
        return new VirtualThreadHealthIndicator();
    }
}