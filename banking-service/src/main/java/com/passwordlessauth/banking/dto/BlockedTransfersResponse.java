package com.passwordlessauth.banking.dto;

/**
 * Response containing the number of transfers currently blocked
 * by banking security/risk controls.
 */
public record BlockedTransfersResponse(long count) {
}