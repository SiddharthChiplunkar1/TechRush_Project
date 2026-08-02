package com.passwordlessauth.client;

public record GoogleUserInfo(
        String googleId,
        String email,
        boolean emailVerified,
        String firstName,
        String lastName
) {
}
