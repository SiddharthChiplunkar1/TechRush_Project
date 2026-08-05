package com.passwordlessauth.banking.security;

public record AuthenticatedUser(
        String userId,
        String email,
        String role,
        String authLevel
) {
    public boolean isStrongAuth() {
        return "STRONG".equalsIgnoreCase(authLevel);
    }

    public boolean isWeakAuth() {
        return "WEAK".equalsIgnoreCase(authLevel);
    }
}