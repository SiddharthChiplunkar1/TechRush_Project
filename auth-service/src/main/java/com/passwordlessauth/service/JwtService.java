package com.passwordlessauth.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.security.SecureRandom;

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

@Slf4j
@Service
public class JwtService {

    private static final String CLAIM_USER_ID      = "userId";
    private static final String CLAIM_ROLE         = "role";
    private static final String CLAIM_AUTH_LEVEL   = "authLevel";
    private static final String CLAIM_TOKEN_VER    = "tokenVersion";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JwtConfig jwtConfig;
    private final SecretKey signingKey;

    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        String secret = jwtConfig.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }

        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

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

    public String generateRefreshToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

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

    public UserPrincipal extractPrincipal(Claims claims) {
        return UserPrincipal.builder()
                .userId(claims.get(CLAIM_USER_ID, String.class))
                .email(claims.getSubject())
                .role(claims.get(CLAIM_ROLE, String.class))
                .authLevel(AuthLevel.valueOf(claims.get(CLAIM_AUTH_LEVEL, String.class)))
                .tokenVersion(claims.get(CLAIM_TOKEN_VER, Integer.class))
                .build();
    }

    public long getAccessTokenExpirySeconds() {
        return jwtConfig.getAccessTokenExpiration() / 1000;
    }
}
