package com.passwordlessauth.client;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.passwordlessauth.exception.GoogleAuthException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GoogleOAuthClientImpl implements GoogleOAuthClient {
    private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

    @Value("${app.google.client-id}")
    private String clientId;

    @Value("${app.google.client-secret:}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public GoogleUserInfo exchangeAuthorizationCode(String authorizationCode, String redirectUri) {
        String idTokenString = requestIdToken(authorizationCode, redirectUri);
        return verifyIdToken(idTokenString);
    }

    @SuppressWarnings("unchecked")
    private String requestIdToken(String authorizationCode, String redirectUri) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", authorizationCode);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        Map<String, Object> tokenResponse;
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_ENDPOINT, request, Map.class);
            tokenResponse = response.getBody();
        } catch (HttpClientErrorException ex) {
            log.warn("Google token exchange rejected: {}", ex.getStatusCode());
            throw new GoogleAuthException("Google sign-in failed. The authorization code may be invalid or expired.");
        } catch (RestClientException ex) {
            log.error("Google OAuth endpoint unreachable: {}", ex.getMessage());
            throw new GoogleAuthException("Google sign-in is temporarily unavailable. Please try again.");
        }

        if (tokenResponse == null || tokenResponse.get("id_token") == null) {
            throw new GoogleAuthException("Google did not return an identity token.");
        }
        return (String) tokenResponse.get("id_token");
    }

    private GoogleUserInfo verifyIdToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new GoogleAuthException("Google identity token failed verification.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            log.info("Google ID token verified for subject {}", maskId(googleId));
            return new GoogleUserInfo(googleId, email, emailVerified, firstName, lastName);

        } catch (GoogleAuthException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to verify Google ID token: {}", ex.getMessage());
            throw new GoogleAuthException("Failed to verify Google identity.");
        }
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }
}
