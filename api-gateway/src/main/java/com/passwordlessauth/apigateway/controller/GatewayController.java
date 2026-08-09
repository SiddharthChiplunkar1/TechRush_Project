package com.passwordlessauth.apigateway.controller;

import java.net.URI;
import java.util.Enumeration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.passwordlessauth.apigateway.config.GatewayProperties;
import com.passwordlessauth.apigateway.config.RequestIdFilter;

@RestController
public class GatewayController {

    private static final Set<String> STRIPPED_HEADERS = Set.of(
            "host", "x-user-id", "x-role", "x-admin", "x-authenticated",
            "x-service-token", "cookie"
    );

    private final RestTemplate restTemplate;
    private final GatewayProperties properties;
    private final ConcurrentMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    public GatewayController(RestTemplate restTemplate, GatewayProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    @GetMapping({"/", "/health"})
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\"}");
    }

    @RequestMapping({"/api/auth/**", "/api/users/**", "/api/devices/**", "/api/admin/**"})
    public ResponseEntity<String> forwardAuth(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward(properties.getAuthUrl(), request, body, method);
    }

    @RequestMapping({"/api/banking/**", "/transactions/**"})
    public ResponseEntity<String> forwardBanking(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward(properties.getBankingUrl(), request, body, method);
    }

    @RequestMapping("/api/face/**")
    public ResponseEntity<String> forwardFace(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        rateLimit(request, properties.getMaxRequestsPerMinute());
        return forward(properties.getFaceUrl(), request, body, method);
    }

    @RequestMapping("/internal/**")
    public ResponseEntity<String> internalBlocked() {
        return ResponseEntity.status(404).body("{\"success\":false,\"error\":\"NOT_FOUND\",\"message\":\"Not found\"}");
    }

    private ResponseEntity<String> forward(String baseUrl, HttpServletRequest request, String body, HttpMethod method) {
        URI upstream = URI.create(baseUrl + request.getRequestURI());
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        if (names != null) {
            while (names.hasMoreElements()) {
                String name = names.nextElement();
                if (STRIPPED_HEADERS.contains(name.toLowerCase())) {
                    continue;
                }
                headers.add(name, request.getHeader(name));
            }
        }
        headers.set("X-Request-ID", (String) request.getAttribute(RequestIdFilter.HEADER_NAME));
        if (baseUrl.equals(properties.getFaceUrl())) {
            headers.set("X-Service-Token", properties.getFaceServiceToken());
        }
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(upstream, method, entity, String.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    private void rateLimit(HttpServletRequest request, int maxPerMinute) {
        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        AtomicInteger count = counters.computeIfAbsent(key, k -> new AtomicInteger());
        if (count.incrementAndGet() > maxPerMinute) {
            throw new IllegalArgumentException("Too many requests");
        }
    }
}
