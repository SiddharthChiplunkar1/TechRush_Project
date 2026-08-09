package com.passwordlessauth.banking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final AuthenticationEntryPoint authenticationEntryPoint;
    private final ObjectMapper objectMapper;

    private final List<String> allowedOrigins;

    public SecurityConfig(
            JwtFilter jwtFilter,
            AuthenticationEntryPoint authenticationEntryPoint,
            ObjectMapper objectMapper,
            @Value("${cors.allowed.origins:http://localhost:3000,http://localhost:5173}") String allowedOrigins
    ) {

        this.jwtFilter = jwtFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.objectMapper = objectMapper;

        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }

    /**
     * Main Spring Security configuration.
     *
     * Authentication model:
     *
     * Request
     *    ↓
     * JwtFilter
     *    ↓
     * SecurityContext
     *    ↓
     * authorization rules
     */
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http
    ) throws Exception {

        http

                /*
                 * CORS is handled by Spring Security before protected
                 * request authorization.
                 */
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                /*
                 * This service uses stateless Bearer-token
                 * authentication.
                 *
                 * JWTs are sent through the Authorization header,
                 * rather than authentication cookies.
                 *
                 * Therefore traditional browser CSRF protection is
                 * not required for these API endpoints.
                 */
                .csrf(csrf -> csrf.disable())

                /*
                 * Authentication failures → 401.
                 */
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler()
                                )
                )

                /*
                 * No server-side HTTP sessions.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                /*
                 * Security headers.
                 */
                .headers(headers ->
                        headers
                                .contentTypeOptions(
                                        contentTypeOptions -> {
                                        }
                                )
                                .frameOptions(frame ->
                                        frame.deny()
                                )
                                .referrerPolicy(referrer ->
                                        referrer.policy(
                                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy
                                                        .STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                                        )
                                )
                                .cacheControl(
                                        cache -> {
                                        }
                                )
                )

                /*
                 * Authorization policy.
                 */
                .authorizeHttpRequests(auth -> auth

                        /*
                         * CORS preflight.
                         */
                        .requestMatchers(
                                org.springframework.http.HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        /*
                         * Minimal public health endpoint.
                         *
                         * Keep the externally exposed health surface
                         * intentionally small.
                         */
                        .requestMatchers(
                                "/health",
                                "/actuator/health"
                        )
                        .permitAll()

                        /*
                         * Do NOT expose /internal/** through ordinary
                         * JWT role authorization.
                         *
                         * A client should never be able to obtain
                         * access to an internal service endpoint merely
                         * by presenting ROLE_INTERNAL.
                         *
                         * This remains blocked until we implement
                         * authenticated service-to-service security.
                         */
                        .requestMatchers("/internal/**")
                        .denyAll()

                        /*
                         * Swagger/OpenAPI should not be publicly
                         * accessible in production.
                         *
                         * We intentionally leave these protected.
                         */
                        .anyRequest()
                        .authenticated()
                )

                /*
                 * JWT authentication must happen before Spring's
                 * username/password authentication filter.
                 */
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * CORS policy.
     *
     * IMPORTANT:
     * We intentionally do not use "*" because credentials are enabled
     * and production should use an explicit frontend allow-list.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        /*
         * Do not expose Authorization unnecessarily.
         *
         * Browsers do not need access to the request Authorization
         * header through JavaScript.
         */
        configuration.setExposedHeaders(
                List.of(
                        "Content-Type"
                )
        );

        /*
         * This is intentionally true only when explicit origins are
         * configured.
         */
        configuration.setAllowCredentials(true);

        /*
         * Cache CORS preflight responses for one hour.
         */
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    /**
     * Handles authenticated users who do not have permission.
     *
     * 401 = not authenticated
     * 403 = authenticated but forbidden
     */
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {

        return (request, response, accessDeniedException) -> {

            if (response.isCommitted()) {
                return;
            }

            response.setStatus(
                    HttpStatus.FORBIDDEN.value()
            );

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.setCharacterEncoding("UTF-8");

            response.setHeader(
                    "Cache-Control",
                    "no-store"
            );

            Map<String, Object> body =
                    Map.of(
                            "success",
                            false,

                            "error",
                            "FORBIDDEN",

                            "message",
                            "You do not have permission to access this resource."
                    );

            objectMapper.writeValue(
                    response.getOutputStream(),
                    body
            );
        };
    }
}