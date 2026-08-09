package com.passwordlessauth.banking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        /*
         * Prevent clients/proxies from caching authentication failures.
         */
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");

        /*
         * Do not expose:
         * - JWT parsing details
         * - exception messages
         * - internal class names
         * - requested URLs
         * - stack traces
         *
         * Authentication failures should have a deliberately generic
         * external response.
         */
        Map<String, Object> body = Map.of(
                "success", false,
                "error", "UNAUTHORIZED",
                "message", "Authentication required",
                "timestamp", Instant.now().toString()
        );

        objectMapper.writeValue(
                response.getOutputStream(),
                body
        );
    }
}