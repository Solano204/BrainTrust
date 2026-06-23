package com.braintrust.containerapp;

import org.apache.coyote.ProtocolHandler;
import org.springframework.boot.web.embedded.tomcat.TomcatProtocolHandlerCustomizer;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class VirtualThreadConfiguration {

    private static final Logger log = LoggerFactory.getLogger(VirtualThreadConfiguration.class);

    @Bean(name = "virtualTaskExecutor")
    public Executor virtualTaskExecutor() {
        log.info("Virtual Thread Executor initialized for @Async operations");
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutor() {
        return protocolHandler -> {
            log.info("Tomcat configured to use Virtual Threads for HTTP requests");
            protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        };
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatOptimization() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            ProtocolHandler handler = connector.getProtocolHandler();
            if (handler instanceof org.apache.coyote.http11.AbstractHttp11Protocol) {
                org.apache.coyote.http11.AbstractHttp11Protocol<?> protocol =
                        (org.apache.coyote.http11.AbstractHttp11Protocol<?>) handler;
                protocol.setConnectionTimeout(60000);
                protocol.setKeepAliveTimeout(60000);
                protocol.setMaxKeepAliveRequests(100);
                log.info("Tomcat connector optimized: timeout=60s, keepAlive=100 requests");
            }
        });
    }

    @Bean
    public VirtualThreadHealthIndicator virtualThreadHealthIndicator() {
        return new VirtualThreadHealthIndicator();
    }
}