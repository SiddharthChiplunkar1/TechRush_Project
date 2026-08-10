package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.StepUpChallenge;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface StepUpChallengeRepository extends JpaRepository<StepUpChallenge, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT c
            FROM StepUpChallenge c
            WHERE c.challengeId = :challengeId
              AND c.userId = :userId
            """)
    Optional<StepUpChallenge> findByChallengeIdAndUserIdForUpdate(
            @Param("challengeId") String challengeId,
            @Param("userId") String userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT c
            FROM StepUpChallenge c
            WHERE c.transactionId = :transactionId
              AND c.userId = :userId
            """)
    Optional<StepUpChallenge> findByTransactionIdAndUserIdForUpdate(
            @Param("transactionId") String transactionId,
            @Param("userId") String userId
    );

    Optional<StepUpChallenge> findFirstByTransactionIdAndUserId(
            String transactionId,
            String userId
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE StepUpChallenge c
            SET c.status = :consumedStatus,
                c.consumedAt = :consumedAt
            WHERE c.transactionId = :transactionId
              AND c.userId = :userId
              AND c.status = :verifiedStatus
              AND c.expiresAt > :consumedAt
            """)
    int consumeVerifiedChallenge(
            @Param("transactionId") String transactionId,
            @Param("userId") String userId,
            @Param("verifiedStatus") com.passwordlessauth.banking.enums.StepUpChallengeStatus verifiedStatus,
            @Param("consumedStatus") com.passwordlessauth.banking.enums.StepUpChallengeStatus consumedStatus,
            @Param("consumedAt") Instant consumedAt
    );
}
