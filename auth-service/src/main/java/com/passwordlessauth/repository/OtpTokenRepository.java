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

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {

    @Query("SELECT o FROM OtpToken o WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.used = false " +
           "AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    List<OtpToken> findValidTokens(
            @Param("email") String email,
            @Param("purpose") String purpose,
            @Param("now") LocalDateTime now);

    default Optional<OtpToken> findLatestValidToken(String email, String purpose, LocalDateTime now) {
        List<OtpToken> tokens = findValidTokens(email, purpose, now);
        return tokens.isEmpty() ? Optional.empty() : Optional.of(tokens.get(0));
    }

    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.used = false")
    void invalidateAllForEmailAndPurpose(
            @Param("email") String email,
            @Param("purpose") String purpose);

    @Query("SELECT COUNT(o) > 0 FROM OtpToken o WHERE o.email = :email " +
           "AND o.purpose = :purpose AND o.createdAt > :since")
    boolean existsRecentToken(
            @Param("email") String email,
            @Param("purpose") String purpose,
            @Param("since") LocalDateTime since);
}