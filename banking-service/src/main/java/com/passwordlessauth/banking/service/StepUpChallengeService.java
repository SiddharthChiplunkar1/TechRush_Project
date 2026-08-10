package com.passwordlessauth.banking.service;

import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.StepUpChallengeStatus;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.StepUpChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class StepUpChallengeService {

    private final StepUpChallengeRepository repository;

    @Value("${app.banking.step-up-ttl-minutes:10}")
    private long stepUpTtlMinutes;

    @Transactional
    public StepUpChallenge createChallenge(
            String userId,
            String transactionId,
            RequiredAuthStrength requiredAuthStrength
    ) {
        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(stepUpTtlMinutes));
        StepUpChallenge existing = repository
                .findFirstByTransactionIdAndUserId(transactionId, userId)
                .orElse(null);

        if (existing != null) {
            return existing;
        }

        StepUpChallenge challenge = StepUpChallenge.create(
                userId,
                transactionId,
                requiredAuthStrength,
                expiresAt
        );

        return repository.save(challenge);
    }

    @Transactional
    public StepUpChallenge verifyChallenge(String challengeId, String userId) {
        StepUpChallenge challenge = repository
                .findByChallengeIdAndUserIdForUpdate(challengeId, userId)
                .orElseThrow(() -> new NotFoundException("Step-up challenge not found"));

        ensureNotExpired(challenge);

        if (challenge.getStatus() != StepUpChallengeStatus.PENDING) {
            throw new FraudDetectedException("Step-up challenge is no longer valid");
        }

        challenge.markVerified(Instant.now());
        return repository.save(challenge);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public StepUpChallenge consumeVerifiedChallenge(String transactionId, String userId) {
        Instant now = Instant.now();
        int updated = repository.consumeVerifiedChallenge(
                transactionId,
                userId,
                StepUpChallengeStatus.VERIFIED,
                StepUpChallengeStatus.CONSUMED,
                now
        );

        if (updated == 0) {
            throw new FraudDetectedException("Additional authentication is required");
        }

        return repository
                .findByTransactionIdAndUserIdForUpdate(transactionId, userId)
                .orElseThrow(() -> new FraudDetectedException("Additional authentication is required"));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public StepUpChallenge cancelChallengeIfPresent(String transactionId, String userId) {
        StepUpChallenge challenge = repository
                .findByTransactionIdAndUserIdForUpdate(transactionId, userId)
                .orElse(null);

        if (challenge == null) {
            return null;
        }

        if (challenge.getStatus() == StepUpChallengeStatus.EXPIRED
                || challenge.getStatus() == StepUpChallengeStatus.CONSUMED
                || challenge.getStatus() == StepUpChallengeStatus.CANCELLED) {
            return challenge;
        }

        ensureNotExpired(challenge);
        challenge.markCancelled(Instant.now());
        return repository.save(challenge);
    }

    private void ensureNotExpired(StepUpChallenge challenge) {
        if (challenge.isExpired(Instant.now())) {
            challenge.markExpired(Instant.now());
            repository.save(challenge);
            throw new FraudDetectedException("Step-up challenge has expired");
        }
    }
}
