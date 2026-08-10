package com.passwordlessauth.apigateway.controller;

import java.net.URI;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;

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

    private static final Set<String> STRIPPED_REQUEST_HEADERS = Set.of(
            "host", "x-user-id", "x-role", "x-admin", "x-authenticated",
            "x-service-token", "cookie", "connection", "content-length",
            "forwarded", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailer", "transfer-encoding", "upgrade", "x-forwarded-for",
            "x-forwarded-host", "x-forwarded-port", "x-forwarded-proto"
    );
    private static final Set<String> FORWARDED_RESPONSE_HEADERS = Set.of(
            "cache-control", "content-disposition", "content-language", "content-type",
            "etag", "last-modified", "location", "set-cookie", "x-request-id"
    );

    private final RestTemplate restTemplate;
    private final GatewayProperties properties;
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
        return forward(properties.getFaceUrl(), request, body, method);
    }

    @RequestMapping("/internal/**")
    public ResponseEntity<String> internalBlocked() {
        return ResponseEntity.status(404).body("{\"success\":false,\"error\":\"NOT_FOUND\",\"message\":\"Not found\"}");
    }

    private ResponseEntity<String> forward(String baseUrl, HttpServletRequest request, String body, HttpMethod method) {
        String query = request.getQueryString();
        URI upstream = URI.create(baseUrl + request.getRequestURI() + (query == null ? "" : "?" + query));
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        if (names != null) {
            while (names.hasMoreElements()) {
                String name = names.nextElement();
                if (STRIPPED_REQUEST_HEADERS.contains(name.toLowerCase())) {
                    continue;
                }
                headers.add(name, request.getHeader(name));
            }
        }
        // The refresh credential is deliberately only forwarded to Auth.
        if (baseUrl.equals(properties.getAuthUrl()) && request.getHeader(HttpHeaders.COOKIE) != null) {
            headers.set(HttpHeaders.COOKIE, request.getHeader(HttpHeaders.COOKIE));
        }
        headers.set("X-Request-ID", (String) request.getAttribute(RequestIdFilter.HEADER_NAME));
        if (baseUrl.equals(properties.getFaceUrl())) {
            headers.set("X-Service-Token", properties.getFaceServiceToken());
        }
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(upstream, method, entity, String.class);
        HttpHeaders safeResponseHeaders = new HttpHeaders();
        response.getHeaders().forEach((name, values) -> {
            if (FORWARDED_RESPONSE_HEADERS.contains(name.toLowerCase())) {
                safeResponseHeaders.put(name, List.copyOf(values));
            }
        });
        if (!safeResponseHeaders.containsKey("X-Request-ID")) {
            safeResponseHeaders.set("X-Request-ID", (String) request.getAttribute(RequestIdFilter.HEADER_NAME));
        }
        return ResponseEntity.status(response.getStatusCode()).headers(safeResponseHeaders).body(response.getBody());
    }
}
