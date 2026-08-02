package com.passwordlessauth.exception;

/**
 * Thrown when a refresh token is missing, revoked, or expired.
 */
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
