package com.passwordlessauth.repository;

import com.passwordlessauth.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {
    @Query("SELECT o FROM OtpToken o WHERE o.email = :email " +
            "AND o.purpose = :purpose AND o.used = false " +
            "AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    List<OtpToken> findValidTokens(String email, String purpose, LocalDateTime now);
}