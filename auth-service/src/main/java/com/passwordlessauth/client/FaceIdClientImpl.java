package com.passwordlessauth.client;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.passwordlessauth.exception.FaceVerificationException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FaceIdClientImpl implements FaceIdClient {

    private static final double FACE_MATCH_THRESHOLD = 0.85;

    @Value("${app.faceid.url:http://localhost:8000}")
    private String faceIdServiceUrl;

    private final RestTemplate restTemplate;

    public FaceIdClientImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void enrollFace(String userId, String imageBase64) {
        String url = faceIdServiceUrl + "/api/face/enroll";
        Map<String, String> body = Map.of(
                "userId", userId,
                "imageBase64", imageBase64
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, Map.class);
            log.info("Face enrollment successful for user {}", maskId(userId));
        } catch (HttpClientErrorException ex) {
            log.error("Face enrollment failed for user {}: {}", maskId(userId), ex.getMessage());
            throw new FaceVerificationException("Face enrollment failed: " + ex.getMessage());
        } catch (ResourceAccessException ex) {
            log.error("FaceID service unreachable: {}", ex.getMessage());
            throw new FaceVerificationException(
                    "Face recognition service is temporarily unavailable. Please try again.");
        }
    }

    @Override
    public FaceVerifyResult verifyFace(String userId, String imageBase64) {
        String url = faceIdServiceUrl + "/api/face/verify";
        Map<String, String> body = Map.of(
                "userId", userId,
                "imageBase64", imageBase64
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<FaceVerifyResult> response =
                    restTemplate.postForEntity(url, request, FaceVerifyResult.class);

            FaceVerifyResult result = response.getBody();
            if (result == null) {
                throw new FaceVerificationException("Empty response from face recognition service");
            }

            log.info("Face verification for user {}: matched={}, confidence={}",
                    maskId(userId), result.isMatched(), result.getConfidence());

            return result;

        } catch (HttpClientErrorException ex) {
            log.error("Face verification failed for user {}: {}", maskId(userId), ex.getMessage());
            throw new FaceVerificationException("Face verification failed");
        } catch (ResourceAccessException ex) {
            log.error("FaceID service unreachable during verification: {}", ex.getMessage());
            throw new FaceVerificationException(
                    "Face recognition service is temporarily unavailable. Please try again.");
        }
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }
}
