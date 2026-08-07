package com.passwordlessauth.banking.exceptions;

public class FraudDetectedException extends RuntimeException {
    public FraudDetectedException(String message) { super(message); }
}
