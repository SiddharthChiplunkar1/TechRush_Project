package com.passwordlessauth.exception;

/**
 * Thrown when an OTP send request is made too soon after the previous one
 * (enforces the OTP resend cooldown period).
 */
public class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
        super(message);
    }
}
