package com.passwordlessauth.apigateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;

@RestController
public class GatewayController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("API Gateway is running");
    }

    @GetMapping("/")
    public ResponseEntity<String> root() {
        return ResponseEntity.ok("API Gateway is running");
    }

    // ─── Auth Service (port 8080 INSIDE container) ──────────────────────────

    @RequestMapping("/api/auth/**")
    public ResponseEntity<String> forwardAuth(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://auth-service:8080", request, body, method);
    }

    @RequestMapping("/api/users/**")
    public ResponseEntity<String> forwardUsers(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://auth-service:8080", request, body, method);
    }

    @RequestMapping("/api/devices/**")
    public ResponseEntity<String> forwardDevices(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://auth-service:8080", request, body, method);
    }

    @RequestMapping("/api/admin/**")
    public ResponseEntity<String> forwardAdmin(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://auth-service:8080", request, body, method);
    }

    // ─── Banking Service (port 8082 INSIDE container) ───────────────────────

    @RequestMapping({"/api/banking/**", "/transactions/**"})
    public ResponseEntity<String> forwardBanking(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://banking-service:8082", request, body, method);
    }

    // ─── FaceID Service (port 8000 INSIDE container) ────────────────────────

    @RequestMapping("/api/face/**")
    public ResponseEntity<String> forwardFace(HttpMethod method, @RequestBody(required = false) String body, HttpServletRequest request) {
        return forward("http://faceid-service:8000", request, body, method);
    }

    // ─── Forward Method ──────────────────────────────────────────────────────

    private ResponseEntity<String> forward(String baseUrl, HttpServletRequest request, String body, HttpMethod method) {
        try {
            String path = request.getRequestURI();
            String fullUrl = baseUrl + path;

            HttpHeaders headers = new HttpHeaders();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String name = headerNames.nextElement();
                headers.add(name, request.getHeader(name));
            }

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fullUrl,
                    method,
                    entity,
                    String.class
            );

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(503).body("{\"error\": \"Service unavailable: " + e.getMessage() + "\"}");
        }
    }
}