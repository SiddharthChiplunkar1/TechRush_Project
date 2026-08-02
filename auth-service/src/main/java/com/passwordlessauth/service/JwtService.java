package com.passwordlessauth.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.passwordlessauth.config.JwtConfig;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.AuthLevel;
import com.passwordlessauth.exception.JwtExpiredException;
import com.passwordlessauth.security.UserPrincipal;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * Central JWT management service.
 *
 * Design decisions:
 * - Access tokens are signed JWTs containing userId, email, role, authLevel, tokenVersion.
 * - Refresh tokens are opaque UUIDs stored in the database (not JWTs), providing true
 *   server-side revocation without complex token blacklisting.
 * - The signing key is derived from the configured secret using HMAC-SHA256, which is
 *   appropriate for a single-service setup. For multi-service, switch to RSA and share
 *   the public key.
 * - tokenVersion is embedded in the access token. If the user's DB tokenVersion is
 *   higher than the token's version, the token is considered revoked (logout-all effect).
 */
@Slf4j
@Service
public class JwtService {

    private static final String CLAIM_USER_ID      = "userId";
    private static final String CLAIM_ROLE         = "role";
    private static final String CLAIM_AUTH_LEVEL   = "authLevel";
    private static final String CLAIM_TOKEN_VER    = "tokenVersion";

    private final JwtConfig jwtConfig;
    private final SecretKey signingKey;

    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        // Keys.hmacShaKeyFor requires at least 256-bit (32 byte) key for HS256.
        this.signingKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    // ─── Access Token ────────────────────────────────────────────────────────

    /**
     * Generates a signed JWT access token for the given user.
     *
     * @param user       the authenticated user
     * @param authLevel  the authentication strength (WEAK = trusted device, STRONG = OTP/Face/OAuth)
     * @return signed JWT string
     */
    public String generateAccessToken(User user, AuthLevel authLevel) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtConfig.getAccessTokenExpiration());

        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(jwtConfig.getIssuer())
                .audience().add(jwtConfig.getAudience()).and()
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim(CLAIM_USER_ID, user.getUserId())
                .claim(CLAIM_ROLE, user.getRole().name())
                .claim(CLAIM_AUTH_LEVEL, authLevel.name())
                .claim(CLAIM_TOKEN_VER, user.getTokenVersion())
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generates an opaque refresh token (UUID) for DB storage.
     * Unlike access tokens, this is NOT a JWT — it is a random secret stored server-side,
     * allowing precise revocation without requiring token blacklisting.
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    // ─── Token Validation ────────────────────────────────────────────────────

    /**
     * Parses and validates an access token. Throws domain exceptions on failure.
     *
     * @param token the raw JWT string (without 'Bearer ' prefix)
     * @return parsed Claims if valid
     * @throws JwtExpiredException if the token has expired
     * @throws JwtException        if the token is malformed or signature is invalid
     */
    public Claims validateAndExtractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.debug("JWT expired: {}", ex.getMessage());
            throw new JwtExpiredException("Access token has expired");
        } catch (JwtException ex) {
            log.warn("Invalid JWT: {}", ex.getMessage());
            throw new JwtException("Invalid or tampered token");
        }
    }

    /**
     * Builds a UserPrincipal from validated JWT claims.
     * Separates validation (validateAndExtractClaims) from principal creation
     * so each step can be unit-tested independently.
     */
    public UserPrincipal extractPrincipal(Claims claims) {
        return UserPrincipal.builder()
                .userId(claims.get(CLAIM_USER_ID, String.class))
                .email(claims.getSubject())
                .role(claims.get(CLAIM_ROLE, String.class))
                .authLevel(AuthLevel.valueOf(claims.get(CLAIM_AUTH_LEVEL, String.class)))
                .tokenVersion(claims.get(CLAIM_TOKEN_VER, Integer.class))
                .build();
    }

    /** Convenience: returns the access token lifetime in seconds for the response body. */
    public long getAccessTokenExpirySeconds() {
        return jwtConfig.getAccessTokenExpiration() / 1000;
    }
}