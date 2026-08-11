package com.passwordlessauth.apigateway.config;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class GatewayRateLimitFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String REQUEST_ID_HEADER = RequestIdFilter.HEADER_NAME;

    private final GatewayProperties properties;
    private final AtomicLong windowMinute = new AtomicLong(currentMinute());
    private final AtomicInteger count = new AtomicInteger();
    private final Object lock = new Object();

    public GatewayRateLimitFilter(GatewayProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "/".equals(path)
                || "/health".equals(path)
                || "/actuator/health".equals(path)
                || "/actuator/info".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (!allowRequest()) {
            writeTooManyRequests(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean allowRequest() {
        long nowMinute = currentMinute();
        synchronized (lock) {
            long currentWindow = windowMinute.get();
            if (currentWindow != nowMinute) {
                windowMinute.set(nowMinute);
                count.set(0);
            }

            return count.incrementAndGet() <= properties.getMaxRequestsPerMinute();
        }
    }

    private void writeTooManyRequests(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String requestId = (String) request.getAttribute(REQUEST_ID_HEADER);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("error", "RATE_LIMIT_EXCEEDED");
        body.put("message", "Too many requests");
        body.put("timestamp", Instant.now().toString());
        if (requestId != null && !requestId.isBlank()) {
            body.put("requestId", requestId);
            response.setHeader(REQUEST_ID_HEADER, requestId);
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        OBJECT_MAPPER.writeValue(response.getOutputStream(), body);
    }

    private static long currentMinute() {
        return System.currentTimeMillis() / 60_000L;
    }
}
