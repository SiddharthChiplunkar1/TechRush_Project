package com.passwordlessauth.repository;

import com.passwordlessauth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for OTP token lifecycle management.
 *
 * Design: Only one active OTP per email+purpose should exist at any time.
 * When a new OTP is generated, all previous ones for the same email+purpose
 * are invalidated. This prevents OTP accumulation attacks.
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {

    /**
     * Finds the most recently created valid (unused, unexpired) OTP for email+purpose.
     * Returns Optional to handle the case where no valid OTP exists.
     */
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.used = false " +
           "AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    List<OtpToken> findValidTokens(
            @Param("email") String email,
            @Param("purpose") String purpose,
            @Param("now") LocalDateTime now);

    /**
     * Convenience: returns the single most recent valid OTP.
     */
    default Optional<OtpToken> findLatestValidToken(String email, String purpose, LocalDateTime now) {
        List<OtpToken> tokens = findValidTokens(email, purpose, now);
        return tokens.isEmpty() ? Optional.empty() : Optional.of(tokens.get(0));
    }

    /**
     * Invalidates all previous OTPs for a given email+purpose.
     * Called before generating a new OTP to ensure single-OTP-per-session policy.
     */
    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.used = false")
    void invalidateAllForEmailAndPurpose(
            @Param("email") String email,
            @Param("purpose") String purpose);

    /**
     * Checks if an OTP was sent within the cooldown period.
     * Used to enforce the resend cooldown (e.g., 60 seconds between sends).
     */
    @Query("SELECT COUNT(o) > 0 FROM OtpToken o WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.createdAt > :since")
    boolean existsRecentToken(
            @Param("email") String email,
            @Param("purpose") String purpose,
            @Param("since") LocalDateTime since);
}