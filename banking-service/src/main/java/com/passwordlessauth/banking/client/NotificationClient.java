package com.passwordlessauth.banking.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Objects;

@Service
public class NotificationClient {

    private static final Logger log =
            LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;

    public NotificationClient(
            RestTemplate restTemplate,
            @Value("${auth.service.url:http://auth-service:8080}") String authServiceUrl
    ) {
        this.restTemplate = Objects.requireNonNull(
                restTemplate,
                "restTemplate must not be null"
        );

        this.notificationServiceUrl = Objects.requireNonNull(
                authServiceUrl,
                "auth.service.url must not be null"
        ).replaceAll("/+$", "") + "/api/notifications";
    }

    /**
     * Sends a notification request to the Auth Service.
     *
     * Notification delivery is deliberately best-effort:
     * a temporary notification-service failure must not cause an
     * otherwise successful banking transaction to fail.
     *
     * IMPORTANT:
     * The notification endpoint must not be used as an authorization
     * mechanism. Authorization is handled by the Banking Service.
     */
    public boolean notifyUser(
            String userId,
            String type,
            String message
    ) {

        validateInput(userId, "userId");
        validateInput(type, "type");
        validateInput(message, "message");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(
                java.util.List.of(MediaType.APPLICATION_JSON)
        );

        Map<String, String> body = Map.of(
                "userId", userId,
                "type", type,
                "message", message
        );

        HttpEntity<Map<String, String>> request =
                new HttpEntity<>(body, headers);

        try {

            restTemplate.postForEntity(
                    notificationServiceUrl,
                    request,
                    String.class
            );

            log.debug(
                    "Notification request accepted for user [{}], type [{}]",
                    maskUserId(userId),
                    type
            );

            return true;

        } catch (RestClientException ex) {

            /*
             * Notification delivery is best-effort.
             *
             * Do NOT log the notification message here because it may
             * contain sensitive banking information.
             */
            log.warn(
                    "Failed to send notification for user [{}], type [{}]: {}",
                    maskUserId(userId),
                    type,
                    ex.getClass().getSimpleName()
            );

            return false;
        }
    }

    private void validateInput(String value, String fieldName) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " must not be null or blank"
            );
        }

        /*
         * Prevent accidentally sending excessively large payloads
         * to the notification service.
         */
        if (value.length() > 2000) {
            throw new IllegalArgumentException(
                    fieldName + " exceeds the maximum allowed length"
            );
        }
    }

    /**
     * Avoid putting complete user identifiers into application logs.
     */
    private String maskUserId(String userId) {

        if (userId == null || userId.length() <= 4) {
            return "****";
        }

        return "****" + userId.substring(userId.length() - 4);
    }
}
