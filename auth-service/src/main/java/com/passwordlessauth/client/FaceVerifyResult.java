package com.passwordlessauth.client;

import lombok.Data;

/**
 * Response from the FaceID service face verification endpoint.
 */
@Data
public class FaceVerifyResult {

    /** True if the submitted face matches the enrolled embedding. */
    private boolean matched;

    /** Confidence score from 0.0 to 1.0. Threshold for acceptance is typically 0.85. */
    private double confidence;

    /** True if liveness detection passed (anti-spoofing blink/motion check). */
    private boolean live;

    /** Error message from FaceID service if verification failed. */
    private String error;
}
