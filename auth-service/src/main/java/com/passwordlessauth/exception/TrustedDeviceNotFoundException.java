package com.passwordlessauth.exception;

public class TrustedDeviceNotFoundException extends RuntimeException {
    public TrustedDeviceNotFoundException(String message) {
        super(message);
    }
}
