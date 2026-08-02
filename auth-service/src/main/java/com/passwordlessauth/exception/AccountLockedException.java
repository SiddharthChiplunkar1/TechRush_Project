package com.passwordlessauth.exception;

/**
 * Thrown when a user account is locked due to too many failed attempts.
 */
public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String message) {
        super(message);
    }
}
