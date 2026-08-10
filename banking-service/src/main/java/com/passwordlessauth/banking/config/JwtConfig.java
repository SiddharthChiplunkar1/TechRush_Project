package com.passwordlessauth.banking.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * JWT cryptographic configuration for the Banking Service.
 *
 * SECURITY REQUIREMENTS:
 *
 * - The JWT secret must never be hardcoded in source code.
 * - Weak secrets must cause application startup to fail.
 * - Weak secrets must NEVER be padded with zero bytes.
 * - The secret must be at least 256 bits (32 bytes) for HS256.
 * - The actual secret must never be written to logs.
 *
 * The secret is expected to be either:
 *
 * 1. Base64 encoded (preferred), or
 * 2. A raw UTF-8 string of at least 32 bytes.
 *
 * The Auth Service and Banking Service MUST use the exact same
 * secret representation/value if they share an HS256 signing key.
 */
@Configuration
public class JwtConfig {

    private static final int MIN_SECRET_BYTES = 32;

    private final String jwtSecret;

    public JwtConfig(
            @Value("${jwt.secret:${app.jwt.secret:}}") String jwtSecret
    ) {
        this.jwtSecret = jwtSecret;
    }

    /**
     * Creates the cryptographic key used to verify JWT signatures.
     *
     * The application intentionally fails during startup if the
     * configured secret is missing or too weak.
     */
    @Bean
    public SecretKey jwtSecretKey() {

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured. " +
                            "Set the JWT_SECRET environment variable."
            );
        }

        // Keep the exact UTF-8 secret representation used by Auth and FaceID.
        // Decoding only this service would derive a different HMAC key.
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

        if (secretBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 bytes " +
                            "(256 bits) for HS256."
            );
        }

        return Keys.hmacShaKeyFor(secretBytes);
    }

    /**
     * Attempts to decode the configured secret as Base64.
     *
     * If the value is not valid Base64, it is treated as a raw UTF-8
     * secret for backwards compatibility with the existing deployment.
     *
     * IMPORTANT:
     * No padding or modification of weak secrets is performed.
     */
    private byte[] decodeSecret(String secret) {

        try {
            byte[] decoded = Base64.getDecoder().decode(secret);

            /*
             * A valid Base64 value may technically decode to an empty
             * or very short value. That is handled by the length check
             * in jwtSecretKey().
             */
            return decoded;

        } catch (IllegalArgumentException ignored) {

            /*
             * Backwards compatibility:
             * allow a raw UTF-8 secret.
             *
             * The caller still enforces the 32-byte minimum.
             */
            return secret.getBytes(StandardCharsets.UTF_8);
        }
    }
}
