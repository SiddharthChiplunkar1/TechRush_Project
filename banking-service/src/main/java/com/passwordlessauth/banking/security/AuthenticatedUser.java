package com.passwordlessauth.banking.security;

/**
 * Immutable representation of the currently authenticated user.
 *
 * This object must only be created from a successfully validated JWT
 * by the security layer. Controllers and clients must never be able
 * to construct authentication state themselves.
 */
public record AuthenticatedUser(
        String userId,
        String email,
        String role,
        String authLevel
) {

    public AuthenticatedUser {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user ID must not be blank"
            );
        }

        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user role must not be blank"
            );
        }

        if (authLevel == null || authLevel.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user authentication level must not be blank"
            );
        }

        userId = userId.trim();
        role = role.trim();
        authLevel = authLevel.trim();
    }

    /**
     * Returns true when the authentication level represents
     * strong authentication.
     */
    public boolean isStrongAuth() {
        return "STRONG".equalsIgnoreCase(authLevel);
    }

    /**
     * Returns true when the authentication level represents
     * weak authentication.
     */
    public boolean isWeakAuth() {
        return "WEAK".equalsIgnoreCase(authLevel);
    }

    /**
     * Returns true when the user has the supplied role.
     */
    public boolean hasRole(String expectedRole) {
        return expectedRole != null
                && expectedRole.equalsIgnoreCase(role);
    }
}