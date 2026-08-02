package com.passwordlessauth.client;

/**
 * Verified identity claims extracted from a Google ID token
 * after the authorization-code exchange succeeds.
 */
public record GoogleUserInfo(
        String googleId,
        String email,
        boolean emailVerified,
        String firstName,
        String lastName
) {
}
