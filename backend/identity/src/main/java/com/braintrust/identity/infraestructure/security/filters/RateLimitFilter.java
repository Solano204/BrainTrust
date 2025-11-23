package com.braintrust.identity.infraestructure.security.filters;

import com.braintrust.identity.infraestructure.security.services.JwtService;
import com.braintrust.identity.infraestructure.security.services.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// @Component
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;
// other imports...

public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(RateLimitFilter.class);
    private final RateLimitService rateLimitService;
    private final JwtService jwtUtil;

    // Endpoints públicos que no necesitan rate limiting estricto
    private static final String[] PUBLIC_ENDPOINTS = {
            "/actuator/health",
            "/v3/api-docs",
            "/swagger-ui"
    };

    public RateLimitFilter(RateLimitService rateLimitService, JwtService jwtUtil) {
        this.rateLimitService = rateLimitService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip rate limiting para endpoints públicos específicos
        String requestPath = request.getRequestURI();
        for (String publicEndpoint : PUBLIC_ENDPOINTS) {
            if (requestPath.startsWith(publicEndpoint)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String clientIdentifier = getClientIdentifier(request);
        String endpoint = getEndpointKey(request);

        if (!rateLimitService.allowRequest(clientIdentifier)) {
            handleRateLimitExceeded(response, clientIdentifier);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // Prioridad 1: Email del JWT (usuarios autenticados)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractUsername(token);
                if (email != null && !email.isEmpty()) {
                    return "user:" + email;
                }
            } catch (Exception e) {
                log.debug("Could not extract email from JWT: {}", e.getMessage());
            }
        }

        // Prioridad 2: IP del cliente
        return "ip:" + getClientIP(request);
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");

        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Tomar solo la primera IP (cliente real)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }

    private String getEndpointKey(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        // Diferentes límites para diferentes endpoints
        if (path.contains("/authenticate") || path.contains("/login")) {
            return "auth";
        } else if (path.contains("/register")) {
            return "register";
        } else if (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) {
            return "write";
        } else {
            return "read";
        }
    }



    //ERRRORASO
    private void handleRateLimitExceeded(HttpServletResponse response, String clientIdentifier)
            throws IOException {
        log.warn("Rate limit exceeded for client: {}", clientIdentifier);

        response.setStatus(429); // Too Many Requests
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60"); // Reintentar en 60 segundos

        String errorJson = String.format(
                "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again in 60 seconds.\",\"status\":429}",
                clientIdentifier
        );

        response.getWriter().write(errorJson);
    }
}