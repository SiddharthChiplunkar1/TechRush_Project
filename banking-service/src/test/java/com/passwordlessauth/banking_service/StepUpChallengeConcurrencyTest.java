package com.passwordlessauth.banking_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.transaction.TestTransaction;

import com.passwordlessauth.banking.BankingServiceApplication;
import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.StepUpChallengeStatus;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.repository.StepUpChallengeRepository;
import com.passwordlessauth.banking.service.StepUpChallengeService;

@DataJpaTest
@Import(StepUpChallengeService.class)
@ContextConfiguration(classes = BankingServiceApplication.class)
@TestPropertySource(properties = "app.banking.step-up-ttl-minutes=10")
class StepUpChallengeConcurrencyTest {

    @Autowired
    private StepUpChallengeRepository repository;

    @Autowired
    private StepUpChallengeService service;

    @Test
    void concurrentConsumption_onlyOneThreadCanConsumeTheChallenge() throws Exception {
        StepUpChallenge challenge = repository.save(
                StepUpChallenge.create(
                        "user-1",
                        "tx-1",
                        RequiredAuthStrength.STRONG,
                        Instant.now().plusSeconds(600)
                )
        );

        service.verifyChallenge(challenge.getChallengeId(), "user-1");
        TestTransaction.flagForCommit();
        TestTransaction.end();

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Callable<StepUpChallengeStatus> task = () -> {
            ready.countDown();
            start.await(5, TimeUnit.SECONDS);
            return service.consumeVerifiedChallenge("tx-1", "user-1").getStatus();
        };

        Future<StepUpChallengeStatus> first = executor.submit(task);
        Future<StepUpChallengeStatus> second = executor.submit(task);

        assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
        start.countDown();

        StepUpChallengeStatus firstResult = null;
        StepUpChallengeStatus secondResult = null;
        Throwable firstFailure = null;
        Throwable secondFailure = null;

        try {
            firstResult = first.get(10, TimeUnit.SECONDS);
        } catch (ExecutionException ex) {
            firstFailure = ex.getCause();
        }

        try {
            secondResult = second.get(10, TimeUnit.SECONDS);
        } catch (ExecutionException ex) {
            secondFailure = ex.getCause();
        }

        assertThat(
                (firstResult != null && firstResult == StepUpChallengeStatus.CONSUMED)
                        ^ (secondResult != null && secondResult == StepUpChallengeStatus.CONSUMED)
        ).isTrue();

        assertThat(firstFailure != null || secondFailure != null).isTrue();

        executor.shutdownNow();
    }
}
