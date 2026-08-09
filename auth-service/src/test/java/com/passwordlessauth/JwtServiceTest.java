package com.passwordlessauth;

import com.passwordlessauth.config.JwtConfig;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.AuthLevel;
import com.passwordlessauth.enums.Role;
import com.passwordlessauth.exception.JwtExpiredException;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtService.
 *
 * All tests run without Spring context — just POJO instantiation.
 * The signing key is a Base64-encoded 32-byte string that satisfies
 * HMAC-SHA256's minimum key length requirement.
 */
class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    // 32-byte secret, Base64-encoded — meets HS256 minimum
    private static final String TEST_SECRET =
            Base64.getEncoder().encodeToString("test-secret-key-32-bytes-exactly!".getBytes());

    @BeforeEach
    void setUp() {
        JwtConfig config = new JwtConfig();
        config.setSecret(TEST_SECRET);
        config.setAccessTokenExpiration(900_000L);   // 15 min
        config.setRefreshTokenExpiration(604_800_000L);
        config.setIssuer("TechRush");
        config.setAudience("techrush-app");

        jwtService = new JwtService(config);

        testUser = new User();
        testUser.setUserId("user-123");
        testUser.setEmail("alice@example.com");
        testUser.setRole(Role.USER);
        testUser.setTokenVersion(0);
    }

    @Test
    void generateAccessToken_containsExpectedClaims() {
        String token = jwtService.generateAccessToken(testUser, AuthLevel.STRONG);

        assertThat(token).isNotBlank();

        Claims claims = jwtService.validateAndExtractClaims(token);
        assertThat(claims.getSubject()).isEqualTo("alice@example.com");
        assertThat(claims.get("userId", String.class)).isEqualTo("user-123");
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
        assertThat(claims.get("authLevel", String.class)).isEqualTo("STRONG");
        assertThat(claims.get("tokenVersion", Integer.class)).isEqualTo(0);
    }

    @Test
    void generateAccessToken_weakAuthLevel_isEncodedCorrectly() {
        String token = jwtService.generateAccessToken(testUser, AuthLevel.WEAK);
        Claims claims = jwtService.validateAndExtractClaims(token);

        assertThat(claims.get("authLevel", String.class)).isEqualTo("WEAK");
    }

    @Test
    void extractPrincipal_buildsCorrectPrincipal() {
        String token = jwtService.generateAccessToken(testUser, AuthLevel.STRONG);
        Claims claims = jwtService.validateAndExtractClaims(token);

        UserPrincipal principal = jwtService.extractPrincipal(claims);

        assertThat(principal.getUserId()).isEqualTo("user-123");
        assertThat(principal.getEmail()).isEqualTo("alice@example.com");
        assertThat(principal.getRole()).isEqualTo("USER");
        assertThat(principal.getAuthLevel()).isEqualTo(AuthLevel.STRONG);
        assertThat(principal.getTokenVersion()).isEqualTo(0);
    }

    @Test
    void validateToken_tamperedSignature_throwsJwtException() {
        String token = jwtService.generateAccessToken(testUser, AuthLevel.STRONG);
        // Corrupt the signature (last segment)
        String[] parts = token.split("\\.");
        String tampered = parts[0] + "." + parts[1] + ".invalidsignature";

        assertThatThrownBy(() -> jwtService.validateAndExtractClaims(tampered))
                .isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    @Test
    void validateToken_expiredToken_throwsJwtExpiredException() {
        // Create a config with 1ms expiry so the token expires immediately
        JwtConfig expiredConfig = new JwtConfig();
        expiredConfig.setSecret(TEST_SECRET);
        expiredConfig.setAccessTokenExpiration(1L);
        expiredConfig.setIssuer("TechRush");
        expiredConfig.setAudience("techrush-app");
        JwtService expiredJwtService = new JwtService(expiredConfig);

        String token = expiredJwtService.generateAccessToken(testUser, AuthLevel.STRONG);

        // Sleep just enough for the token to expire
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        assertThatThrownBy(() -> expiredJwtService.validateAndExtractClaims(token))
                .isInstanceOf(JwtExpiredException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void generateRefreshToken_isSecureRandomToken() {
        String rt = jwtService.generateRefreshToken();

        assertThat(rt).isNotBlank();
        assertThat(rt).doesNotContain("=");
        assertThat(rt.length()).isGreaterThan(20);
    }

    @Test
    void getAccessTokenExpirySeconds_returnsMillisConvertedToSeconds() {
        // 900_000 ms → 900 s
        assertThat(jwtService.getAccessTokenExpirySeconds()).isEqualTo(900L);
    }

    @Test
    void tokenVersion_incrementedUser_differentTokenVersion() {
        testUser.setTokenVersion(5);
        String token = jwtService.generateAccessToken(testUser, AuthLevel.STRONG);
        Claims claims = jwtService.validateAndExtractClaims(token);

        assertThat(claims.get("tokenVersion", Integer.class)).isEqualTo(5);
    }
}
