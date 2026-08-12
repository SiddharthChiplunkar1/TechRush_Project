package com.passwordlessauth.banking.client;

import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.exceptions.TooManyRequestsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Objects;
import java.util.Map;

@Service
public class UserResolverClient {

    private static final Logger log = LoggerFactory.getLogger(UserResolverClient.class);

    private final RestTemplate restTemplate;
    private final String authServiceUrl;
    private final String internalServiceToken;

    public UserResolverClient(
            RestTemplate restTemplate,
            @Value("${auth.service.url:http://auth-service:8080}") String authServiceUrl,
            @Value("${auth.service.internal-token:}") String internalServiceToken) {
        this.restTemplate = Objects.requireNonNull(restTemplate, "restTemplate must not be null");
        this.authServiceUrl = Objects.requireNonNull(authServiceUrl, "auth.service.url must not be null")
                .replaceAll("/+$", "");
        this.internalServiceToken = internalServiceToken;
    }

    public String resolveRecipientId(String identifier) {
        if (identifier == null || identifier.isBlank() || !identifier.contains("@")) {
            return identifier;
        }
        if (internalServiceToken == null || internalServiceToken.isBlank()) {
            throw new NotFoundException("Destination account not found");
        }

        String uri = UriComponentsBuilder.fromUriString(authServiceUrl + "/internal/users/resolve")
                .queryParam("email", identifier.trim().toLowerCase())
                .build()
                .encode()
                .toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service-Token", internalServiceToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        try {
            UserLookupResponse response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    UserLookupResponse.class).getBody();
            if (response == null || response.userId() == null || response.userId().isBlank()) {
                throw new NotFoundException("Destination account not found");
            }
            return response.userId();
        } catch (RestClientException ex) {
            log.warn("Recipient resolution failed: {}", ex.getClass().getSimpleName());
            throw new NotFoundException("Destination account not found");
        }
    }

    public void requestTransferOtp(String userId) {
        exchangeTransferOtp("/request", Map.of("userId", userId));
    }

    public void verifyTransferOtp(String userId, String otp) {
        exchangeTransferOtp("/verify", Map.of("userId", userId, "otp", otp));
    }

    private void exchangeTransferOtp(String operation, Map<String, String> body) {
        if (internalServiceToken == null || internalServiceToken.isBlank()) {
            throw new IllegalStateException("Internal service token is not configured");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Service-Token", internalServiceToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            restTemplate.postForEntity(
                    authServiceUrl + "/internal/transfer/step-up" + operation,
                    new HttpEntity<>(body, headers),
                    Void.class);
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 429) {
                log.info("Transfer OTP cooldown active in auth service");
                throw new TooManyRequestsException(
                        "A transfer OTP was already sent. Please use the latest code."
                );
            }
            if (ex.getStatusCode().is4xxClientError()) {
                log.info("Transfer OTP rejected by auth service: status={}", ex.getStatusCode());
                throw new IllegalArgumentException("Transfer OTP was rejected");
            }
            log.warn("Transfer OTP service returned an upstream error: status={}", ex.getStatusCode());
            throw new IllegalStateException("Transfer OTP verification unavailable");
        } catch (RestClientException ex) {
            log.warn("Transfer OTP operation failed: {}", ex.getClass().getSimpleName());
            throw new IllegalStateException("Transfer OTP verification unavailable");
        }
    }

    private record UserLookupResponse(String userId) {
    }
}
