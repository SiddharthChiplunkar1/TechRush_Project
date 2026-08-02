package com.passwordlessauth.repository;

import com.passwordlessauth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, " +
           "r.revokedAt = :now, r.revokedReason = :reason " +
           "WHERE r.user.userId = :userId AND r.revoked = false")
    void revokeAllUserTokens(
            @Param("userId") String userId,
            @Param("reason") String reason,
            @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, " +
           "r.revokedAt = CURRENT_TIMESTAMP, r.revokedReason = 'DEVICE_REMOVED' " +
           "WHERE r.deviceId = :deviceId AND r.revoked = false")
    void revokeAllDeviceTokens(@Param("deviceId") String deviceId);

    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.user.userId = :userId " +
           "AND r.revoked = false AND r.expiresAt > CURRENT_TIMESTAMP")
    long countActiveTokensByUser(@Param("userId") String userId);
}
