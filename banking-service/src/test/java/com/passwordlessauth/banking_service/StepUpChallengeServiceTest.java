package com.passwordlessauth.banking_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.StepUpChallengeStatus;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.StepUpChallengeRepository;
import com.passwordlessauth.banking.service.StepUpChallengeService;

class StepUpChallengeServiceTest {

    private final StepUpChallengeRepository repository = mock(StepUpChallengeRepository.class);
    private StepUpChallengeService service;

    @BeforeEach
    void setUp() {
        service = new StepUpChallengeService(repository);
    }

    @Test
    void createChallenge_persistsPendingChallenge() {
        when(repository.findFirstByTransactionIdAndUserId("tx-1", "user-1"))
                .thenReturn(Optional.empty());
        when(repository.save(any(StepUpChallenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StepUpChallenge challenge = service.createChallenge(
                "user-1",
                "tx-1",
                RequiredAuthStrength.STRONG
        );

        assertThat(challenge.getChallengeId()).isNotBlank();
        assertThat(challenge.getStatus()).isEqualTo(StepUpChallengeStatus.PENDING);
        assertThat(challenge.getRequiredAuthStrength()).isEqualTo(RequiredAuthStrength.STRONG);
        assertThat(challenge.getChallengeHash()).isNotBlank();
        verify(repository).save(any(StepUpChallenge.class));
    }

    @Test
    void verifyChallenge_marksVerifiedForCorrectUser() {
        StepUpChallenge challenge = StepUpChallenge.create(
                "user-1",
                "tx-1",
                RequiredAuthStrength.STRONG,
                Instant.now().plusSeconds(600)
        );
        when(repository.findByChallengeIdAndUserIdForUpdate(challenge.getChallengeId(), "user-1"))
                .thenReturn(Optional.of(challenge));
        when(repository.save(any(StepUpChallenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StepUpChallenge verified = service.verifyChallenge(challenge.getChallengeId(), "user-1");

        assertThat(verified.getStatus()).isEqualTo(StepUpChallengeStatus.VERIFIED);
        assertThat(verified.getVerifiedAt()).isNotNull();
    }

    @Test
    void verifyChallenge_wrongUserThrowsNotFound() {
        when(repository.findByChallengeIdAndUserIdForUpdate("challenge-1", "user-2"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.verifyChallenge("challenge-1", "user-2"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void consumeVerifiedChallenge_marksConsumedAndRejectsReplay() {
        StepUpChallenge verifiedChallenge = StepUpChallenge.create(
                "user-1",
                "tx-1",
                RequiredAuthStrength.STRONG,
                Instant.now().plusSeconds(600)
        );
        verifiedChallenge.markVerified(Instant.now());
        StepUpChallenge consumedChallenge = StepUpChallenge.create(
                "user-1",
                "tx-1",
                RequiredAuthStrength.STRONG,
                Instant.now().plusSeconds(600)
        );
        consumedChallenge.markVerified(Instant.now());
        consumedChallenge.markConsumed(Instant.now());

        when(repository.consumeVerifiedChallenge(
                eq("tx-1"),
                eq("user-1"),
                eq(StepUpChallengeStatus.VERIFIED),
                eq(StepUpChallengeStatus.CONSUMED),
                any(Instant.class)
        )).thenReturn(1, 0);
        when(repository.findByTransactionIdAndUserIdForUpdate("tx-1", "user-1"))
                .thenReturn(Optional.of(consumedChallenge));

        StepUpChallenge consumed = service.consumeVerifiedChallenge("tx-1", "user-1");

        assertThat(consumed.getStatus()).isEqualTo(StepUpChallengeStatus.CONSUMED);
        assertThat(consumed.getConsumedAt()).isNotNull();

        assertThatThrownBy(() -> service.consumeVerifiedChallenge("tx-1", "user-1"))
                .isInstanceOf(FraudDetectedException.class);
    }

    @Test
    void expiredChallenge_isRejectedAndMarkedExpired() {
        StepUpChallenge challenge = StepUpChallenge.create(
                "user-1",
                "tx-1",
                RequiredAuthStrength.STRONG,
                Instant.now().minusSeconds(10)
        );
        when(repository.findByChallengeIdAndUserIdForUpdate(challenge.getChallengeId(), "user-1"))
                .thenReturn(Optional.of(challenge));

        assertThatThrownBy(() -> service.verifyChallenge(challenge.getChallengeId(), "user-1"))
                .isInstanceOf(FraudDetectedException.class);
        assertThat(challenge.getStatus()).isEqualTo(StepUpChallengeStatus.EXPIRED);
    }
}
