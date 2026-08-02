package com.passwordlessauth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.passwordlessauth.config.JwtFilter;

import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Central Spring Security configuration for the auth-service.
 *
 * Security design decisions:
 * - CSRF is disabled because this is a stateless REST API authenticated via JWTs.
 *   CSRF protection is only needed for cookie/session-based authentication.
 * - Sessions are STATELESS because the server holds no session state; every request
 *   must present a valid JWT.
 * - CORS is configured explicitly. In production, replace "*" with the actual frontend origin.
 * - The JwtFilter runs BEFORE Spring Security's username/password filter so we can
 *   populate the SecurityContext from the token before any authorization checks.
 * - BCrypt with strength 12 is used for OTP hashing. Strength 12 provides ~250ms
 *   hashing time on modern hardware, which is acceptable for security without being
 *   too slow for user-facing flows.
 *
 * NOTE: This class is in the 'security' package. The empty SecurityConfig.java
 * that was scaffolded in this package has been replaced by this full implementation.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Stateless API — no CSRF needed
                .csrf(AbstractHttpConfigurer::disable)

                // No HTTP sessions
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // CORS from the CorsConfigurationSource bean below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // No form login or HTTP Basic
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login/otp",
                                "/api/auth/login/otp/verify",
                                "/api/auth/login/face",
                                "/api/auth/login/google",
                                "/api/auth/refresh"
                        ).permitAll()
                        // Admin endpoints — require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // JWT filter runs before the standard username/password filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    /**
     * BCrypt password encoder used to hash OTPs before storage.
     * Strength 12 = ~250ms per hash, appropriate for server-side OTP hashing.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * CORS configuration allowing the React frontend to call the auth service.
     * In production, replace the allowed origin with the actual deployment URL.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",   // React dev server
                "http://localhost:5173"    // Vite dev server (if used)
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hour preflight cache

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
