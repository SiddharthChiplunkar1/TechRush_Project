package com.passwordlessauth.banking.entity;

import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.StepUpChallengeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
        name = "step_up_challenges",
        indexes = {
                @Index(name = "idx_step_up_user_id", columnList = "user_id"),
                @Index(name = "idx_step_up_transaction_id", columnList = "transaction_id"),
                @Index(name = "idx_step_up_status", columnList = "status"),
                @Index(name = "idx_step_up_expires_at", columnList = "expires_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class StepUpChallenge {

    @Id
    @Column(
            name = "challenge_id",
            nullable = false,
            updatable = false,
            length = 64
    )
    private String challengeId;

    @Column(
            name = "user_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String userId;

    @Column(
            name = "transaction_id",
            nullable = false,
            unique = true,
            updatable = false,
            length = 36
    )
    private String transactionId;

    @Column(
            name = "challenge_hash",
            nullable = false,
            length = 64
    )
    private String challengeHash;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private StepUpChallengeStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "required_auth_strength",
            nullable = false,
            length = 20
    )
    private RequiredAuthStrength requiredAuthStrength;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "verified_at"
    )
    private Instant verifiedAt;

    @Column(
            name = "consumed_at"
    )
    private Instant consumedAt;

    @Version
    @Column(
            nullable = false
    )
    private Long version;

    public static StepUpChallenge create(
            String userId,
            String transactionId,
            RequiredAuthStrength requiredAuthStrength,
            Instant expiresAt
    ) {
        StepUpChallenge challenge = new StepUpChallenge();
        challenge.challengeId = generateChallengeId();
        challenge.userId = requireIdentifier(userId, "User");
        challenge.transactionId = requireIdentifier(transactionId, "Transaction");
        challenge.requiredAuthStrength = Objects.requireNonNull(requiredAuthStrength, "requiredAuthStrength must not be null");
        challenge.status = StepUpChallengeStatus.PENDING;
        challenge.expiresAt = Objects.requireNonNull(expiresAt, "expiresAt must not be null");
        challenge.challengeHash = hashChallenge(
                challenge.challengeId,
                challenge.userId,
                challenge.transactionId,
                challenge.requiredAuthStrength.name(),
                challenge.expiresAt.toString()
        );
        return challenge;
    }

    public boolean isExpired(Instant now) {
        return expiresAt != null && now != null && !expiresAt.isAfter(now);
    }

    public boolean isTerminal() {
        return status == StepUpChallengeStatus.CONSUMED
                || status == StepUpChallengeStatus.CANCELLED
                || status == StepUpChallengeStatus.EXPIRED;
    }

    public void markVerified(Instant verifiedAt) {
        ensureActive();
        if (status != StepUpChallengeStatus.PENDING) {
            throw new IllegalStateException("Step-up challenge is not pending");
        }
        this.status = StepUpChallengeStatus.VERIFIED;
        this.verifiedAt = Objects.requireNonNull(verifiedAt, "verifiedAt must not be null");
    }

    public void markConsumed(Instant consumedAt) {
        ensureVerified();
        this.status = StepUpChallengeStatus.CONSUMED;
        this.consumedAt = Objects.requireNonNull(consumedAt, "consumedAt must not be null");
    }

    public void markCancelled(Instant consumedAt) {
        if (isTerminal()) {
            return;
        }
        this.status = StepUpChallengeStatus.CANCELLED;
        this.consumedAt = Objects.requireNonNull(consumedAt, "consumedAt must not be null");
    }

    public void markExpired(Instant expiredAt) {
        if (isTerminal()) {
            return;
        }
        this.status = StepUpChallengeStatus.EXPIRED;
        this.consumedAt = expiredAt;
    }

    public String getChallengeHash() {
        return challengeHash;
    }

    private void ensureActive() {
        if (isTerminal()) {
            throw new IllegalStateException("Step-up challenge is already terminal");
        }
    }

    private void ensureVerified() {
        if (status != StepUpChallengeStatus.VERIFIED) {
            throw new IllegalStateException("Step-up challenge is not consumable");
        }
    }

    @PrePersist
    protected void prePersist() {
        if (challengeId == null || challengeId.isBlank()) {
            challengeId = generateChallengeId();
        }
        if (status == null) {
            status = StepUpChallengeStatus.PENDING;
        }
        if (requiredAuthStrength == null) {
            requiredAuthStrength = RequiredAuthStrength.STRONG;
        }
        validateState();
    }

    private void validateState() {
        requireIdentifier(userId, "User");
        requireIdentifier(transactionId, "Transaction");
        if (challengeHash == null || challengeHash.isBlank()) {
            throw new IllegalStateException("Challenge hash must not be blank");
        }
        if (expiresAt == null) {
            throw new IllegalStateException("Step-up challenge expiry must not be null");
        }
    }

    private static String generateChallengeId() {
        byte[] bytes = new byte[24];
        SecureRandomHolder.INSTANCE.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashChallenge(String... values) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (String value : values) {
                digest.update(value.getBytes(StandardCharsets.UTF_8));
                digest.update((byte) ':');
            }
            byte[] hash = digest.digest();
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private static String requireIdentifier(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }

    private static final class SecureRandomHolder {
        private static final java.security.SecureRandom INSTANCE = new java.security.SecureRandom();
    }
}
