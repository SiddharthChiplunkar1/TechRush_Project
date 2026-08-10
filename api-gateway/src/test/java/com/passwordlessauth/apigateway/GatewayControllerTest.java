package com.passwordlessauth.apigateway;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.URI;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

@SpringBootTest(properties = {
        "gateway.auth-url=http://auth-service:8080",
        "gateway.banking-url=http://banking-service:8082",
        "gateway.face-url=http://faceid-service:8000",
        "gateway.face-service-token=test-faceid-service-token",
        "gateway.allowed-origins=http://localhost:3000,http://localhost:5173"
})
@AutoConfigureMockMvc
class GatewayControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    RestTemplate restTemplate;

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
    void authorizationHeaderIsPreservedWhenForwarding() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"ok\":true}"));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        org.mockito.ArgumentCaptor<HttpEntity<String>> captor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.GET), captor.capture(), eq(String.class));
        org.springframework.http.HttpHeaders headers = captor.getValue().getHeaders();
        org.junit.jupiter.api.Assertions.assertEquals("Bearer token", headers.getFirst("Authorization"));
    }

    @Test
    void internalEndpointsAreBlocked() throws Exception {
        mockMvc.perform(get("/internal/risk"))
                .andExpect(status().isNotFound());
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
    void browserSecurityHeadersAreSetAtTheGatewayBoundary() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    /**
     * Regression test: Gateway must pass through 401 from downstream as 401, NOT 503.
     *
     * Root cause of the original 503 bug: RestTemplate's DefaultResponseErrorHandler throws
     * HttpClientErrorException (a RestClientException subclass) for 4xx responses. The
     * GatewayExceptionHandler then caught RestClientException and blindly returned 503.
     * With the PassthroughResponseErrorHandler installed in GatewayHttpConfig, RestTemplate
     * no longer throws on 4xx — it returns the ResponseEntity normally, and the gateway
     * relays the correct status code to the client.
     */
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

        org.mockito.ArgumentCaptor<HttpEntity<String>> entityCaptor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        org.mockito.Mockito.verify(restTemplate).exchange(any(URI.class), eq(HttpMethod.POST), entityCaptor.capture(), eq(String.class));
        org.junit.jupiter.api.Assertions.assertEquals("refresh_token=existing",
                entityCaptor.getValue().getHeaders().getFirst(HttpHeaders.COOKIE));
    }

    @Test
    void queryParametersAreForwardedWithoutChangingTheDownstreamPath() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("[]"));

        mockMvc.perform(get("/api/banking/transactions?page=2&size=10")
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());

        org.mockito.ArgumentCaptor<URI> uriCaptor = org.mockito.ArgumentCaptor.forClass(URI.class);
        org.mockito.Mockito.verify(restTemplate).exchange(uriCaptor.capture(), eq(HttpMethod.GET), any(), eq(String.class));
        org.junit.jupiter.api.Assertions.assertEquals("http://banking-service:8082/api/banking/transactions?page=2&size=10",
                uriCaptor.getValue().toString());
    }

    @Test
    void connectivityFailureIsReportedAsBadGateway() throws Exception {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("connection refused"));

        mockMvc.perform(get("/api/banking/balance"))
                .andExpect(status().isBadGateway());
    }
}
