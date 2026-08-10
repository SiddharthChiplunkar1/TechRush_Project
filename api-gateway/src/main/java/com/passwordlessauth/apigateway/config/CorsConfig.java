package com.passwordlessauth.apigateway.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    private static final List<String> ALLOWED_METHODS = List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
    );

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "X-Device-Id",
            "X-Request-ID"
    );

    private static final List<String> EXPOSED_HEADERS = List.of(
            "X-Request-ID"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            GatewayProperties properties
    ) {
        List<String> origins = parseAndValidateOrigins(
                properties.getAllowedOrigins()
        );

        CorsConfiguration config = new CorsConfiguration();

        /*
         * Credentials are required because the Auth Service uses
         * an HttpOnly refresh-token cookie.
         *
         * Therefore wildcard origins are explicitly forbidden.
         */
        config.setAllowCredentials(true);
        config.setAllowedOrigins(origins);

        config.setAllowedMethods(ALLOWED_METHODS);
        config.setAllowedHeaders(ALLOWED_HEADERS);
        config.setExposedHeaders(EXPOSED_HEADERS);

        /*
         * Cache successful CORS preflight responses for 30 minutes.
         * This is only a performance optimization; it does not affect
         * authorization.
         */
        config.setMaxAge(1800L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    private List<String> parseAndValidateOrigins(String configuredOrigins) {
        if (!StringUtils.hasText(configuredOrigins)) {
            throw new IllegalStateException(
                    "Gateway CORS allowed origins must be configured"
            );
        }

        List<String> origins = Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "Gateway CORS allowed origins must not be empty"
            );
        }

        if (origins.stream().anyMatch("*"::equals)) {
            throw new IllegalStateException(
                    "Wildcard CORS origins are forbidden when credentials are enabled"
            );
        }

        origins.forEach(origin -> {
            if (!isValidOrigin(origin)) {
                throw new IllegalStateException(
                        "Invalid CORS origin configured: " + origin
                );
            }
        });

        return origins;
    }

    private boolean isValidOrigin(String origin) {
        /*
         * CORS origins must be absolute origins.
         *
         * Examples:
         *   http://localhost:5173
         *   https://app.example.com
         *
         * Paths, query strings and fragments are not valid origins.
         */
        try {
            java.net.URI uri = java.net.URI.create(origin);

            return uri.getScheme() != null
                    && (uri.getScheme().equalsIgnoreCase("http")
                    || uri.getScheme().equalsIgnoreCase("https"))
                    && uri.getHost() != null
                    && uri.getPath().isEmpty()
                    && uri.getQuery() == null
                    && uri.getFragment() == null;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter(
            CorsConfigurationSource corsConfigurationSource
    ) {
        FilterRegistrationBean<CorsFilter> bean =
                new FilterRegistrationBean<>(
                        new CorsFilter(corsConfigurationSource)
                );

        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return bean;
    }
}