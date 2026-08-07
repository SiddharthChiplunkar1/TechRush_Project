package com.passwordlessauth.banking.client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class NotificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public void notifyUser(String userId, String type, String message) {
        String url = "http://auth-service:8080/api/notifications";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = Map.of(
                "userId", userId,
                "type", type,
                "message", message
        );
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        try {
            restTemplate.postForEntity(url, req, String.class);
        } catch (Exception e) {
            // best-effort
        }
    }
}
