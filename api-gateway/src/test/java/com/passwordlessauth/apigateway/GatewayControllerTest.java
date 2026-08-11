package com.passwordlessauth.apigateway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.SocketTimeoutException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;

import jakarta.servlet.FilterChain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.passwordlessauth.apigateway.config.CorsConfig;
import com.passwordlessauth.apigateway.config.GatewayProperties;
import com.passwordlessauth.apigateway.config.GatewayRateLimitFilter;

@SpringBootTest(properties = {
        "gateway.auth-url=http://auth-service:8080",
        "gateway.banking-url=http://banking-service:8082",
        "gateway.face-url=http://faceid-service:8000",
        "gateway.face-service-token=test-faceid-service-token",
        "gateway.allowed-origins=http://localhost:3000,http://localhost:5173",
        "gateway.max-requests-per-minute=120"
})
@AutoConfigureMockMvc
class GatewayControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RestTemplate restTemplate;

    @BeforeEach
    void resetMock() {
        reset(restTemplate);
    }

    @Test
    void authRouteForwardsRequest() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(post("/api/auth/login/otp/request")
                        .header("Authorization", "Bearer token")
                        .contentType("application/json")
                        .content("{\"email\":\"alice@example.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void allHttpMethodsAreRouted() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.PUT), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("put"));
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.PATCH), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("patch"));
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.DELETE), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("delete"));

        mockMvc.perform(put("/api/users/profile").content("{}"))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/users/profile").content("{}"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/users/profile"))
                .andExpect(status().isOk());
    }

    @Test
    void authorizationHeaderIsPreservedWhenForwarding() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        HttpHeaders headers = captor.getValue().getHeaders();
        assertEquals("Bearer token", headers.getFirst("Authorization"));
    }

    @Test
    void browserIdentityHeadersAreStripped() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer token")
                        .header("X-User-Id", "attacker")
                        .header("X-Role", "admin")
                        .header("X-Admin", "true")
                        .header("X-Authenticated", "true")
                        .header("X-Service-Token", "browser-token")
                        .header("X-Forwarded-For", "1.2.3.4")
                        .header("Host", "evil.example"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        HttpHeaders headers = captor.getValue().getHeaders();
        assertFalse(headers.containsKey("X-User-Id"));
        assertFalse(headers.containsKey("X-Role"));
        assertFalse(headers.containsKey("X-Admin"));
        assertFalse(headers.containsKey("X-Authenticated"));
        assertFalse(headers.containsKey("X-Service-Token"));
        assertFalse(headers.containsKey("X-Forwarded-For"));
        assertFalse(headers.containsKey("Host"));
    }

    @Test
    void refreshCookieIsForwardedOnlyToAuth() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(post("/api/auth/refresh")
                        .header(HttpHeaders.COOKIE, "refresh_token=existing; theme=dark; session=abc")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.POST), captor.capture(), eq(String.class));
        assertEquals("refresh_token=existing", captor.getValue().getHeaders().getFirst(HttpHeaders.COOKIE));
    }

    @Test
    void refreshCookieIsNotForwardedToBanking() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/banking/balance")
                        .header(HttpHeaders.COOKIE, "refresh_token=existing; theme=dark")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        assertFalse(captor.getValue().getHeaders().containsKey(HttpHeaders.COOKIE));
    }

    @Test
    void refreshCookieIsNotForwardedToFace() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/face/verify")
                        .header(HttpHeaders.COOKIE, "refresh_token=existing; theme=dark")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        assertFalse(captor.getValue().getHeaders().containsKey(HttpHeaders.COOKIE));
    }

    @Test
    void faceRouteInjectsServiceTokenAndIgnoresBrowserToken() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/face/verify")
                        .header("Authorization", "Bearer token")
                        .header("X-Service-Token", "browser-token"))
                .andExpect(status().isOk());

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        assertEquals("test-faceid-service-token", captor.getValue().getHeaders().getFirst("X-Service-Token"));
    }

    @Test
    void internalEndpointsAreBlocked() throws Exception {
        mockMvc.perform(get("/internal/risk"))
                .andExpect(status().isNotFound());
    }

    @Test
    void rootHealthEndpointWorks() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"));
    }

    @Test
    void actuatorHealthIsExposedButSensitiveActuatorEndpointsAreNot() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/env"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/actuator/beans"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/actuator/mappings"))
                .andExpect(status().isNotFound());
    }

    @Test
    void queryParametersAreForwardedWithoutChangingTheDownstreamPath() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("[]"));

        mockMvc.perform(get("/api/banking/transactions?page=0&size=20&sort=createdAt%2Cdesc&tag=a&tag=b&empty=")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        org.mockito.Mockito.verify(restTemplate).exchange(uriCaptor.capture(), eq(HttpMethod.GET), any(), eq(String.class));
        assertEquals("http://banking-service:8082/api/banking/transactions?page=0&size=20&sort=createdAt%252Cdesc&tag=a&tag=b&empty=", uriCaptor.getValue().toString());
    }

    @Test
    void downstreamUnauthorizedIsRelayedAs401NotMaskedAs503() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"success\":false,\"error\":\"UNAUTHORIZED\"}"));

        mockMvc.perform(get("/api/banking/balance"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void downstreamForbiddenIsRelayedAs403NotMaskedAs503() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("{\"success\":false,\"error\":\"FORBIDDEN\"}"));

        mockMvc.perform(get("/api/banking/balance")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void downstreamNotFoundIsRelayedAs404NotMaskedAs503() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"success\":false,\"error\":\"NOT_FOUND\"}"));

        mockMvc.perform(get("/api/banking/nonexistent")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound());
    }

    @Test
    void downstreamBadRequestIsRelayedAs400() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("{\"success\":false,\"error\":\"BAD_REQUEST\"}"));

        mockMvc.perform(get("/api/face/verify")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void downstreamTooManyRequestsIsRelayedAs429() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("{\"success\":false,\"error\":\"RATE_LIMITED\"}"));

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void timeoutIsReportedAsGatewayTimeout() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("read timed out", new SocketTimeoutException("read timed out")));

        mockMvc.perform(get("/api/banking/balance"))
                .andExpect(status().isGatewayTimeout());
    }

    @Test
    void connectivityFailureIsReportedAsBadGateway() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("connection refused"));

        mockMvc.perform(get("/api/banking/balance"))
                .andExpect(status().isBadGateway());
    }

    @Test
    void unexpectedExceptionIsReportedAsInternalServerError() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenThrow(new IllegalStateException("boom"));

        mockMvc.perform(get("/api/banking/balance"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void validRequestIdIsPreserved() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/users/me")
                        .header("X-Request-ID", "abc12345")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", "abc12345"));

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        assertEquals("abc12345", captor.getValue().getHeaders().getFirst("X-Request-ID"));
    }

    @Test
    void invalidRequestIdIsReplaced() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        MvcResult result = mockMvc.perform(get("/api/users/me")
                        .header("X-Request-ID", "bad")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andReturn();

        String requestId = result.getResponse().getHeader("X-Request-ID");
        assertNotNull(requestId);
        assertTrue(requestId.matches("[A-Za-z0-9._-]{8,64}"));

        ArgumentCaptor<HttpEntity<String>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        assertNotEquals("bad", captor.getValue().getHeaders().getFirst("X-Request-ID"));
    }

    @Test
    void oversizedRequestIdIsReplaced() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        String oversized = "a".repeat(200);
        MvcResult result = mockMvc.perform(get("/api/users/me")
                        .header("X-Request-ID", oversized)
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andReturn();

        String requestId = result.getResponse().getHeader("X-Request-ID");
        assertNotNull(requestId);
        assertTrue(requestId.matches("[A-Za-z0-9._-]{8,64}"));
    }

    @Test
    void allowedCorsOriginReceivesHeader() throws Exception {
        mockMvc.perform(options("/api/auth/login/otp/request")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    void invalidCorsOriginIsRejectedByConfiguration() {
        GatewayProperties properties = new GatewayProperties();
        properties.setAllowedOrigins("http://localhost:3000/app");

        assertThrows(IllegalStateException.class, () -> new CorsConfig().corsConfigurationSource(properties));
    }

    @Test
    void browserSecurityHeadersAreSetAtTheGatewayBoundary() throws Exception {
        mockMvc.perform(get("/health").secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Permissions-Policy", "camera=(), geolocation=(), microphone=()"))
                .andExpect(header().string("Strict-Transport-Security", "max-age=31536000; includeSubDomains"));
    }

    @Test
    void responseHeadersPreserveSafeValuesAndStripUnsafeOnAuthRoute() throws Exception {
        HttpHeaders upstreamHeaders = new HttpHeaders();
        upstreamHeaders.add(HttpHeaders.SET_COOKIE, "refresh_token=rotated; Path=/api/auth; HttpOnly; SameSite=Lax");
        upstreamHeaders.add(HttpHeaders.SET_COOKIE, "csrf=abc; Path=/; HttpOnly");
        upstreamHeaders.add(HttpHeaders.LOCATION, "/api/auth/success");
        upstreamHeaders.add(HttpHeaders.CACHE_CONTROL, "no-store");
        upstreamHeaders.add(HttpHeaders.SERVER, "upstream");
        upstreamHeaders.add(HttpHeaders.VIA, "1.1 upstream");
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("{\"ok\":true}", upstreamHeaders, HttpStatus.OK));

        mockMvc.perform(post("/api/auth/refresh")
                        .header(HttpHeaders.COOKIE, "refresh_token=existing")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Location", "/api/auth/success"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().stringValues(HttpHeaders.SET_COOKIE,
                        "refresh_token=rotated; Path=/api/auth; HttpOnly; SameSite=Lax",
                        "csrf=abc; Path=/; HttpOnly"));
    }

    @Test
    void responseHeadersDoNotExposeUnsafeValuesOnBankingRoute() throws Exception {
        HttpHeaders upstreamHeaders = new HttpHeaders();
        upstreamHeaders.add(HttpHeaders.SET_COOKIE, "tracking=1; Path=/; HttpOnly");
        upstreamHeaders.add(HttpHeaders.SERVER, "upstream");
        upstreamHeaders.add(HttpHeaders.VIA, "1.1 upstream");
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("{\"ok\":true}", upstreamHeaders, HttpStatus.OK));

        mockMvc.perform(get("/api/banking/balance")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE))
                .andExpect(header().doesNotExist(HttpHeaders.SERVER))
                .andExpect(header().doesNotExist(HttpHeaders.VIA));
    }

    @Test
    void refreshCookieAndSetCookieAreRelayedOnlyThroughAuthRoute() throws Exception {
        HttpHeaders upstreamHeaders = new HttpHeaders();
        upstreamHeaders.add(HttpHeaders.SET_COOKIE, "refresh_token=rotated; Path=/api/auth; HttpOnly; SameSite=Lax");
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("{\"ok\":true}", upstreamHeaders, HttpStatus.OK));

        mockMvc.perform(post("/api/auth/refresh")
                        .header(HttpHeaders.COOKIE, "refresh_token=existing")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE,
                        "refresh_token=rotated; Path=/api/auth; HttpOnly; SameSite=Lax"));
    }

    @Test
    void rateLimitFilterReturns429AndResetsPerWindow() throws Exception {
        GatewayProperties properties = new GatewayProperties();
        properties.setMaxRequestsPerMinute(1);
        GatewayRateLimitFilter filter = new GatewayRateLimitFilter(properties);

        MockHttpServletRequest firstRequest = new MockHttpServletRequest("GET", "/api/users/me");
        MockHttpServletResponse firstResponse = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(firstRequest, firstResponse, chain);
        assertEquals(200, firstResponse.getStatus());

        MockHttpServletRequest secondRequest = new MockHttpServletRequest("GET", "/api/users/me");
        MockHttpServletResponse secondResponse = new MockHttpServletResponse();
        filter.doFilter(secondRequest, secondResponse, new MockFilterChain());
        assertEquals(429, secondResponse.getStatus());
        assertTrue(secondResponse.getContentAsString().contains("RATE_LIMIT_EXCEEDED"));
    }
}
