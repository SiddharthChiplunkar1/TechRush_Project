package com.passwordlessauth.client;

import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.passwordlessauth.exception.FaceVerificationException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FaceIdClientImpl implements FaceIdClient {

    private static final int MAX_IMAGE_BASE64_LENGTH = 2_000_000;

    private final String faceIdServiceUrl;
    private final String faceIdServiceToken;
    private final RestTemplate restTemplate;

    public FaceIdClientImpl(
            @Value("${app.faceid.url}") String faceIdServiceUrl,
            @Value("${app.faceid.service-token}") String faceIdServiceToken,
            RestTemplate restTemplate
    ) {
        if (!StringUtils.hasText(faceIdServiceUrl)) {
            throw new IllegalStateException(
                    "FaceID service URL must be configured"
            );
        }

        if (!StringUtils.hasText(faceIdServiceToken)) {
            throw new IllegalStateException(
                    "FaceID service token must be configured"
            );
        }

        this.faceIdServiceUrl = normalizeBaseUrl(faceIdServiceUrl);
        this.faceIdServiceToken = faceIdServiceToken;
        this.restTemplate = restTemplate;
    }

    @Override
    public void enrollFace(
            String userId,
            String imageBase64
    ) throws FaceVerificationException {

        validateInput(userId, imageBase64);

        String url = faceIdServiceUrl + "/api/face/enroll";

        Map<String, String> body = Map.of(
                "userId", userId,
                "image_base64", imageBase64
        );

        try {
            ResponseEntity<Void> response =
                    restTemplate.postForEntity(
                            url,
                            buildRequest(userId, body),
                            Void.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new FaceVerificationException(
                        "Face enrollment could not be completed"
                );
            }

            log.info(
                    "Face enrollment completed for user={}",
                    maskId(userId)
            );

        } catch (HttpStatusCodeException ex) {

            /*
             * Never expose upstream response bodies or exception details.
             * They may contain implementation information.
             */
            log.warn(
                    "Face enrollment rejected for user={} status={}",
                    maskId(userId),
                    ex.getStatusCode().value()
            );

            throw new FaceVerificationException(
                    "Face enrollment could not be completed"
            );

        } catch (ResourceAccessException ex) {

            log.error(
                    "FaceID service unavailable during enrollment for user={}",
                    maskId(userId)
            );

            throw new FaceVerificationException(
                    "Face recognition service is temporarily unavailable"
            );

        } catch (FaceVerificationException ex) {
            throw ex;

        } catch (Exception ex) {

            log.error(
                    "Unexpected FaceID enrollment failure for user={}",
                    maskId(userId),
                    ex
            );

            throw new FaceVerificationException(
                    "Face enrollment could not be completed"
            );
        }
    }

    @Override
    public FaceVerifyResult verifyFace(
            String userId,
            String imageBase64
    ) throws FaceVerificationException {

        validateInput(userId, imageBase64);

        String url = faceIdServiceUrl + "/api/face/verify";

        Map<String, String> body = Map.of(
                "userId", userId,
                "image_base64", imageBase64
        );

        try {
            ResponseEntity<FaceVerifyResult> response =
                    restTemplate.postForEntity(
                            url,
                            buildRequest(userId, body),
                            FaceVerifyResult.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new FaceVerificationException(
                        "Face verification could not be completed"
                );
            }

            FaceVerifyResult result = response.getBody();

            if (result == null) {
                log.error(
                        "FaceID returned empty verification response for user={}",
                        maskId(userId)
                );

                throw new FaceVerificationException(
                        "Face verification could not be completed"
                );
            }

            /*
             * Do not log biometric confidence scores.
             * They are sensitive authentication information and are
             * unnecessary for normal operational logging.
             */
            log.info(
                    "Face verification completed for user={} matched={}",
                    maskId(userId),
                    result.isMatched()
            );

            return result;

        } catch (HttpStatusCodeException ex) {

            log.warn(
                    "Face verification rejected for user={} status={}",
                    maskId(userId),
                    ex.getStatusCode().value()
            );

            throw new FaceVerificationException(
                    "Face verification could not be completed"
            );

        } catch (ResourceAccessException ex) {

            log.error(
                    "FaceID service unavailable during verification for user={}",
                    maskId(userId)
            );

            throw new FaceVerificationException(
                    "Face recognition service is temporarily unavailable"
            );

        } catch (FaceVerificationException ex) {
            throw ex;

        } catch (Exception ex) {

            log.error(
                    "Unexpected FaceID verification failure for user={}",
                    maskId(userId),
                    ex
            );

            throw new FaceVerificationException(
                    "Face verification could not be completed"
            );
        }
    }

    @Override
    public FaceVerifyResult verifyLive(String userId, List<String> frames) throws FaceVerificationException {
        if (frames == null || frames.size() < 3 || frames.size() > 15) {
            throw new FaceVerificationException("Face liveness verification requires a short frame burst");
        }

        String url = faceIdServiceUrl + "/api/face/verify-live";
        Map<String, Object> body = Map.of("userId", userId, "frames", frames);
        try {
            ResponseEntity<FaceVerifyResult> response = restTemplate.postForEntity(
                    url, buildRequest(userId, body), FaceVerifyResult.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new FaceVerificationException("Face verification could not be completed");
            }
            return response.getBody();
        } catch (HttpStatusCodeException | ResourceAccessException ex) {
            log.warn("Face liveness verification failed for user={} status={}", maskId(userId),
                    ex instanceof HttpStatusCodeException http ? http.getStatusCode().value() : "unavailable");
            throw new FaceVerificationException("Face recognition service is temporarily unavailable");
        } catch (FaceVerificationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected FaceID liveness failure for user={}", maskId(userId), ex);
            throw new FaceVerificationException("Face verification could not be completed");
        }
    }

    private HttpEntity<Map<String, ?>> buildRequest(
            String userId,
            Map<String, ?> body
    ) {
        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        /*
         * Service-to-service authentication.
         * This credential is injected by Auth and cannot come from
         * the browser.
         */
        headers.set(
                "X-Service-Token",
                faceIdServiceToken
        );

        /*
         * This header is retained only because the existing FaceID
         * contract uses it. FaceID must NOT trust it without validating
         * the service credential first.
         */
        headers.set(
                "X-User-Id",
                userId
        );

        return new HttpEntity<>(body, headers);
    }

    private void validateInput(
            String userId,
            String imageBase64
    ) {
        if (!StringUtils.hasText(userId)) {
            throw new FaceVerificationException(
                    "User identity is required"
            );
        }

        if (!StringUtils.hasText(imageBase64)) {
            throw new FaceVerificationException(
                    "Face image is required"
            );
        }

        /*
         * Prevent accidentally sending multi-megabyte biometric
         * payloads to the FaceID service.
         *
         * This is a defensive upper bound; the HTTP/API layer should
         * also enforce its own request-size limit.
         */
        if (imageBase64.length() > MAX_IMAGE_BASE64_LENGTH) {
            throw new FaceVerificationException(
                    "Face image is too large"
            );
        }
    }

    private String normalizeBaseUrl(String url) {
        String normalized = url.trim();

        while (normalized.endsWith("/")) {
            normalized =
                    normalized.substring(
                            0,
                            normalized.length() - 1
                    );
        }

        return normalized;
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) {
            return "***";
        }

        return id.substring(0, 4) + "...";
    }
}
