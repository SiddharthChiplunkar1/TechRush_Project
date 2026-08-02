package com.passwordlessauth.exception;

/**
 * Thrown when Google authorization-code exchange or ID token verification fails.
 */
public class GoogleAuthException extends RuntimeException {
    public GoogleAuthException(String message) {
        super(message);
    }
}
