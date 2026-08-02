package com.passwordlessauth.repository;

import com.passwordlessauth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for refresh token persistence and revocation.
 *
 * Refresh tokens are opaque UUIDs stored in the DB.
 * They can be revoked individually (single logout) or in bulk (logout-all-devices).
 *
 * The revokeAll* methods use bulk UPDATE queries for performance when a user has
 * many active sessions (e.g., multiple browser tabs, mobile apps).
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    /** Find a token by its value for validation during token refresh. */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Revokes all refresh tokens for a user across all devices.
     * Called during logout-all-devices and security incidents.
     * Also records the revocation timestamp and reason for audit purposes.
     */
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, " +
           "r.revokedAt = :now, r.revokedReason = :reason " +
           "WHERE r.user.userId = :userId AND r.revoked = false")
    void revokeAllUserTokens(
            @Param("userId") String userId,
            @Param("reason") String reason,
            @Param("now") LocalDateTime now);

    /**
     * Revokes all refresh tokens associated with a specific device.
     * Called when a user removes a trusted device.
     */
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, " +
           "r.revokedAt = CURRENT_TIMESTAMP, r.revokedReason = 'DEVICE_REMOVED' " +
           "WHERE r.deviceId = :deviceId AND r.revoked = false")
    void revokeAllDeviceTokens(@Param("deviceId") String deviceId);

    /**
     * Count of active (non-revoked, non-expired) tokens per user.
     * Useful for admin dashboards showing active sessions.
     */
    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.user.userId = :userId " +
           "AND r.revoked = false AND r.expiresAt > CURRENT_TIMESTAMP")
    long countActiveTokensByUser(@Param("userId") String userId);
}
