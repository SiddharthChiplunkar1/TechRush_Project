package com.passwordlessauth.exception;

/**
 * Thrown when a registration attempt is made with an email that already exists.
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String email) {
        super("User already registered with email: " + email);
    }
}
