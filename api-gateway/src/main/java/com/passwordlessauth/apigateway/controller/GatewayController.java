package com.passwordlessauth.apigateway.controller;

import java.net.URI;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.passwordlessauth.apigateway.config.GatewayProperties;
import com.passwordlessauth.apigateway.config.RequestIdFilter;

@RestController
public class GatewayController {

    private static final String COOKIE = HttpHeaders.COOKIE;
    private static final String AUTHORIZATION = HttpHeaders.AUTHORIZATION;
    private static final String REQUEST_ID = RequestIdFilter.HEADER_NAME;
    private static final String SERVICE_TOKEN = "X-Service-Token";

    /*
     * Browser-controlled headers that must never be trusted or forwarded
     * to internal services.
     */
    private static final Set<String> BLOCKED_REQUEST_HEADERS = Set.of(
            "host",
            "content-length",
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade",
            "forwarded",
            "x-forwarded-for",
            "x-forwarded-host",
            "x-forwarded-port",
            "x-forwarded-proto",
            "x-user-id",
            "x-role",
            "x-admin",
            "x-authenticated",
            "x-service-token",
            "cookie",
            "origin",
            "access-control-request-method",
            "access-control-request-headers"
    );

    /*
     * Only expose headers that are useful and safe for the browser.
     */
    private static final Set<String> ALLOWED_RESPONSE_HEADERS = Set.of(
            "cache-control",
            "content-disposition",
            "content-language",
            "content-type",
            "etag",
            "last-modified",
            "location",
            "set-cookie",
            "x-request-id"
    );

    private final RestTemplate restTemplate;
    private final GatewayProperties properties;

    public GatewayController(
            RestTemplate restTemplate,
            GatewayProperties properties
    ) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    @RequestMapping(
            value = {"/", "/health"},
            method = RequestMethod.GET
    )
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\"}");
    }

    @RequestMapping({
            "/api/auth/**",
            "/api/users/**",
            "/api/devices/**",
            "/api/admin/**"
    })
    public ResponseEntity<String> forwardAuth(
            HttpMethod method,
            @RequestBody(required = false) String body,
            HttpServletRequest request
    ) {
        return forward(
                properties.getAuthUrl(),
                Service.AUTH,
                method,
                request,
                body
        );
    }

    @RequestMapping({
            "/api/banking/**",
            "/transactions/**"
    })
    public ResponseEntity<String> forwardBanking(
            HttpMethod method,
            @RequestBody(required = false) String body,
            HttpServletRequest request
    ) {
        return forward(
                properties.getBankingUrl(),
                Service.BANKING,
                method,
                request,
                body
        );
    }

    @RequestMapping("/api/face/**")
    public ResponseEntity<String> forwardFace(
            HttpMethod method,
            @RequestBody(required = false) String body,
            HttpServletRequest request
    ) {
        return forward(
                properties.getFaceUrl(),
                Service.FACE,
                method,
                request,
                body
        );
    }

    /*
     * Internal APIs are intentionally not browser-accessible through
     * the public Gateway.
     */
    @RequestMapping("/internal/**")
    public ResponseEntity<String> internalBlocked() {
        return ResponseEntity
                .status(404)
                .body("""
                        {"success":false,"error":"NOT_FOUND","message":"Not found"}
                        """);
    }

    private ResponseEntity<String> forward(
            String baseUrl,
            Service service,
            HttpMethod method,
            HttpServletRequest request,
            String body
    ) {
        URI upstream = buildUpstreamUri(baseUrl, request);

        HttpHeaders headers = buildRequestHeaders(
                request,
                service
        );

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        upstream,
                        method,
                        entity,
                        String.class
                );

        return buildResponse(response, request);
    }

    private URI buildUpstreamUri(
            String baseUrl,
            HttpServletRequest request
    ) {
        String requestPath = request.getRequestURI();
        String query = request.getQueryString();

        UriComponentsBuilder builder =
                UriComponentsBuilder
                        .fromUriString(baseUrl)
                        .path(requestPath);

        if (query != null && !query.isBlank()) {
            builder.query(query);
        }

        return builder
                .build(true)
                .toUri();
    }

    private HttpHeaders buildRequestHeaders(
            HttpServletRequest request,
            Service service
    ) {
        HttpHeaders headers = new HttpHeaders();

        Enumeration<String> names =
                request.getHeaderNames();

        if (names != null) {
            while (names.hasMoreElements()) {
                String name = names.nextElement();

                if (shouldBlockRequestHeader(name)) {
                    continue;
                }

                Enumeration<String> values =
                        request.getHeaders(name);

                if (values == null) {
                    continue;
                }

                while (values.hasMoreElements()) {
                    headers.add(
                            name,
                            values.nextElement()
                    );
                }
            }
        }

        /*
         * Authorization is intentionally preserved.
         * Banking/Auth/FaceID validate it themselves.
         */
        copyHeader(
                request,
                AUTHORIZATION,
                headers
        );

        /*
         * Refresh cookies are ONLY forwarded to Auth.
         *
         * Banking and FaceID must never receive the user's
         * refresh-token cookie.
         */
        if (service == Service.AUTH) {
            copyHeader(
                    request,
                    COOKIE,
                    headers
            );
        }

        /*
         * Request ID is generated/validated by the Gateway filter.
         * Never trust an arbitrary value directly from this method.
         */
        String requestId =
                (String) request.getAttribute(
                        REQUEST_ID
                );

        if (requestId != null && !requestId.isBlank()) {
            headers.set(
                    REQUEST_ID,
                    requestId
            );
        }

        /*
         * FaceID requires a server-to-service credential.
         * The browser cannot provide or override it.
         */
        if (service == Service.FACE) {
            String serviceToken =
                    properties.getFaceServiceToken();

            if (serviceToken == null
                    || serviceToken.isBlank()) {
                throw new IllegalStateException(
                        "FaceID service token is not configured"
                );
            }

            headers.set(
                    SERVICE_TOKEN,
                    serviceToken
            );
        }

        return headers;
    }

    private boolean shouldBlockRequestHeader(
            String headerName
    ) {
        return BLOCKED_REQUEST_HEADERS.contains(
                headerName.toLowerCase(Locale.ROOT)
        );
    }

    private void copyHeader(
            HttpServletRequest request,
            String name,
            HttpHeaders target
    ) {
        Enumeration<String> values =
                request.getHeaders(name);

        if (values == null) {
            return;
        }

        while (values.hasMoreElements()) {
            target.add(
                    name,
                    values.nextElement()
            );
        }
    }

    private ResponseEntity<String> buildResponse(
            ResponseEntity<String> response,
            HttpServletRequest request
    ) {
        HttpHeaders safeHeaders =
                new HttpHeaders();

        response.getHeaders().forEach(
                (name, values) -> {
                    if (ALLOWED_RESPONSE_HEADERS.contains(
                            name.toLowerCase(Locale.ROOT)
                    )) {
                        safeHeaders.put(
                                name,
                                List.copyOf(values)
                        );
                    }
                }
        );

        String requestId =
                (String) request.getAttribute(
                        REQUEST_ID
                );

        if (requestId != null
                && !requestId.isBlank()
                && !safeHeaders.containsKey(REQUEST_ID)) {

            safeHeaders.set(
                    REQUEST_ID,
                    requestId
            );
        }

        return ResponseEntity
                .status(response.getStatusCode())
                .headers(safeHeaders)
                .body(response.getBody());
    }

    private enum Service {
        AUTH,
        BANKING,
        FACE
    }
}