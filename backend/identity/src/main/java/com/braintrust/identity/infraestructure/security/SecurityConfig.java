
package com.braintrust.identity.infraestructure.security;

import com.braintrust.identity.infraestructure.security.filters.JwtAuthenticationEntryPoint;
import com.braintrust.identity.infraestructure.security.filters.JwtAuthenticationFilter;
import com.braintrust.identity.infraestructure.security.filters.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsService userDetailsService, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/**",

                                "/**",
                                "/api/users/register/**",
                                "/api/users/authenticate",

                                "/api/users/refresh-token",
                                "/api/users/email-available/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/**",
                                "/**",
                                "/complete",
                                "/v3/api-docs/**",           // OpenAPI JSON/YAML
                                "/swagger-ui/**",            // Swagger UI resources
                                "/swagger-ui.html",          // Swagger UI entry point
                                "/swagger-resources/**",     // Swagger resources
                                "/webjars/**",               // Webjars (used by Swagger UI)
                                "/configuration/**"          // Swagger configuration
                        ).permitAll()

                        .requestMatchers("/actuator/health").permitAll()

                        .requestMatchers("/api/users/register/admin").hasRole("ADMIN")
                        .requestMatchers("/api/users/register/admin").hasRole("ADMIN")
                        .requestMatchers("/api/users/*/activate").hasRole("ADMIN")
                        .requestMatchers("/api/users/*/deactivate").hasRole("ADMIN")


                        .requestMatchers("/api/courses").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/assignments").hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/submissions/**").hasAnyRole("STUDENT", "TEACHER", "ADMIN")

                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .headers(headers -> headers
                        .contentTypeOptions(contentTypeOptions -> {})
                        .xssProtection(xss -> {})
                        .cacheControl(cache -> {})
                        .httpStrictTransportSecurity(hsts ->
                                hsts.includeSubDomains(true)
                                        .maxAgeInSeconds(31536000))
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // In production, specify exact origins
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:4200",
                "https://yourdomain.com"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin"
        ));

        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}