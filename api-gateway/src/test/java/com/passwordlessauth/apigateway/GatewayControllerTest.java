package com.passwordlessauth.apigateway;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

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
}
