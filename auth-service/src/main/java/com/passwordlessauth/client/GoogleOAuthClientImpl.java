package com.passwordlessauth.client;

import java.net.URI;
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
import org.springframework.util.StringUtils;
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

    private static final String TOKEN_ENDPOINT =
            "https://oauth2.googleapis.com/token";

    private static final int MAX_AUTHORIZATION_CODE_LENGTH = 4096;

    private final String clientId;
    private final String clientSecret;
    private final String allowedRedirectUri;

    private final RestTemplate restTemplate;
    private final GoogleIdTokenVerifier verifier;

    public GoogleOAuthClientImpl(
            @Value("${app.google.client-id}") String clientId,
            @Value("${app.google.client-secret}") String clientSecret,
            @Value("${app.google.redirect-uri}") String allowedRedirectUri,
            RestTemplate restTemplate
    ) {
        if (!StringUtils.hasText(clientId)) {
            throw new IllegalStateException(
                    "Google OAuth client ID must be configured"
            );
        }

        if (!StringUtils.hasText(clientSecret)) {
            throw new IllegalStateException(
                    "Google OAuth client secret must be configured"
            );
        }

        if (!StringUtils.hasText(allowedRedirectUri)) {
            throw new IllegalStateException(
                    "Google OAuth redirect URI must be configured"
            );
        }

        validateRedirectUri(allowedRedirectUri);

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.allowedRedirectUri = allowedRedirectUri;
        this.restTemplate = restTemplate;

        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    @Override
    public GoogleUserInfo exchangeAuthorizationCode(
            String authorizationCode,
            String redirectUri
    ) {
        validateAuthorizationCode(authorizationCode);

        /*
         * Never trust an arbitrary redirect URI supplied by the browser.
         */
        if (!allowedRedirectUri.equals(redirectUri)) {
            log.warn("Rejected Google OAuth redirect URI");
            throw new GoogleAuthException(
                    "Google sign-in failed"
            );
        }

        String idToken = requestIdToken(authorizationCode);

        return verifyIdToken(idToken);
    }

    private String requestIdToken(
            String authorizationCode
    ) {
        MultiValueMap<String, String> form =
                new LinkedMultiValueMap<>();

        form.add("code", authorizationCode);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", allowedRedirectUri);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.APPLICATION_FORM_URLENCODED
        );

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(form, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            TOKEN_ENDPOINT,
                            request,
                            Map.class
                    );

            Map<String, Object> tokenResponse =
                    response.getBody();

            if (tokenResponse == null) {
                throw new GoogleAuthException(
                        "Google sign-in failed"
                );
            }

            Object idToken =
                    tokenResponse.get("id_token");

            if (!(idToken instanceof String idTokenValue)
                    || !StringUtils.hasText(idTokenValue)) {

                throw new GoogleAuthException(
                        "Google sign-in failed"
                );
            }

            return idTokenValue;

        } catch (GoogleAuthException ex) {
            throw ex;

        } catch (RestClientException ex) {

            /*
             * Do not expose Google's response or exception details.
             */
            log.warn("Google OAuth token exchange failed");

            throw new GoogleAuthException(
                    "Google sign-in is temporarily unavailable"
            );
        }
    }

    private GoogleUserInfo verifyIdToken(
            String idTokenString
    ) {
        try {
            GoogleIdToken idToken =
                    verifier.verify(idTokenString);

            if (idToken == null) {
                throw new GoogleAuthException(
                        "Google identity verification failed"
                );
            }

            GoogleIdToken.Payload payload =
                    idToken.getPayload();

            String issuer = payload.getIssuer();

            if (!"https://accounts.google.com".equals(issuer)
                    && !"accounts.google.com".equals(issuer)) {

                throw new GoogleAuthException(
                        "Google identity verification failed"
                );
            }

            String googleId =
                    payload.getSubject();

            String email =
                    payload.getEmail();

            boolean emailVerified =
                    Boolean.TRUE.equals(
                            payload.getEmailVerified()
                    );

            if (!StringUtils.hasText(googleId)
                    || !StringUtils.hasText(email)
                    || !emailVerified) {

                throw new GoogleAuthException(
                        "Google identity verification failed"
                );
            }

            String firstName =
                    getClaimAsString(
                            payload,
                            "given_name"
                    );

            String lastName =
                    getClaimAsString(
                            payload,
                            "family_name"
                    );

            log.info(
                    "Google identity verified subject={}",
                    maskId(googleId)
            );

            return new GoogleUserInfo(
                    googleId,
                    email,
                    true,
                    firstName,
                    lastName
            );

        } catch (GoogleAuthException ex) {
            throw ex;

        } catch (Exception ex) {

            log.warn(
                    "Google identity token verification failed"
            );

            throw new GoogleAuthException(
                    "Google identity verification failed"
            );
        }
    }

    private String getClaimAsString(
            GoogleIdToken.Payload payload,
            String claim
    ) {
        Object value = payload.get(claim);

        return value instanceof String
                ? (String) value
                : null;
    }

    private void validateAuthorizationCode(
            String authorizationCode
    ) {
        if (!StringUtils.hasText(authorizationCode)
                || authorizationCode.length()
                > MAX_AUTHORIZATION_CODE_LENGTH) {

            throw new GoogleAuthException(
                    "Invalid Google authorization code"
            );
        }
    }

    private void validateRedirectUri(
            String redirectUri
    ) {
        try {
            URI uri = URI.create(redirectUri);

            if (!"https".equalsIgnoreCase(uri.getScheme())
                    && !"http".equalsIgnoreCase(uri.getScheme())) {

                throw new IllegalStateException(
                        "Invalid Google OAuth redirect URI"
                );
            }

            if (!StringUtils.hasText(uri.getHost())) {
                throw new IllegalStateException(
                        "Invalid Google OAuth redirect URI"
                );
            }

        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "Invalid Google OAuth redirect URI",
                    ex
            );
        }
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) {
            return "***";
        }

        return id.substring(0, 4) + "...";
    }
}