package com.passwordlessauth.banking_service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.passwordlessauth.banking.client.NotificationClient;
import com.passwordlessauth.banking.client.RiskClient;
import com.passwordlessauth.banking.dto.ConfirmTransferRequest;
import com.passwordlessauth.banking.dto.TransferRequest;
import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.entity.Account;
import com.passwordlessauth.banking.entity.BankTransaction;
import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.RiskLevel;
import com.passwordlessauth.banking.enums.TransactionStatus;
import com.passwordlessauth.banking.exceptions.InsufficientFundsException;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.AccountRepository;
import com.passwordlessauth.banking.repository.TransactionRepository;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import com.passwordlessauth.banking.service.BankingService;
import com.passwordlessauth.banking.service.StepUpChallengeService;

class BankingServiceSecurityTest {

    private final AccountRepository accounts = mock(AccountRepository.class);
    private final TransactionRepository transactions = mock(TransactionRepository.class);
    private final NotificationClient notifications = mock(NotificationClient.class);
    private final RiskClient risk = mock(RiskClient.class);
    private final StepUpChallengeService stepUpChallenges = mock(StepUpChallengeService.class);
    private final AuthenticatedUser userA = new AuthenticatedUser("user-a", "a@example.test", "USER", "WEAK");
    private final AuthenticatedUser userB = new AuthenticatedUser("user-b", "b@example.test", "USER", "STRONG");
    private BankingService service;

    @BeforeEach
    void setUp() {
        service = new BankingService(accounts, transactions, notifications, risk, stepUpChallenges);
    }

    @Test
    void initiateTransferUsesAuthenticatedUserAsSender() {
        Account source = account("account-a", "user-a", "100.00");
        Account destination = account("account-b", "user-b", "0.00");
        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(source));
        when(accounts.findByUserId("user-b")).thenReturn(Optional.of(destination));
        when(risk.assessRisk("user-a", new BigDecimal("10.00"), "user-b")).thenReturn(RiskLevel.LOW);
        when(transactions.save(any(BankTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.initiateTransfer(new TransferRequest("user-b", new BigDecimal("10.00"), null), userA);

        verify(accounts).findByUserIdForUpdate("user-a");
        verify(risk).assessRisk("user-a", new BigDecimal("10.00"), "user-b");
        verify(stepUpChallenges, org.mockito.Mockito.never()).createChallenge(any(), any(), any());
    }

    @Test
    void transferRejectsInvalidAmountsAndInsufficientFunds() {
        assertThatThrownBy(() -> service.initiateTransfer(
                new TransferRequest("user-b", BigDecimal.ZERO, null), userA))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.initiateTransfer(
                new TransferRequest("user-b", new BigDecimal("1.001"), null), userA))
                .isInstanceOf(IllegalArgumentException.class);

        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(account("account-a", "user-a", "5.00")));
        when(accounts.findByUserId("user-b")).thenReturn(Optional.of(account("account-b", "user-b", "0.00")));
        assertThatThrownBy(() -> service.initiateTransfer(
                new TransferRequest("user-b", new BigDecimal("10.00"), null), userA))
                .isInstanceOf(InsufficientFundsException.class);
    }

    @Test
    void userCannotConfirmAnotherUsersTransfer() {
        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(account("account-a", "user-a", "100.00")));
        when(transactions.findByTransactionIdAndFromAccountIdForUpdate(eq("transfer-b"), eq("account-a")))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.confirmTransfer(new ConfirmTransferRequest("transfer-b", true), userA))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void highRiskTransferCannotBeConfirmedWithWeakAuthentication() {
        Account source = account("account-a", "user-a", "100.00");
        BankTransaction transfer = BankTransaction.create("account-a", "account-b", new BigDecimal("10.00"), null, RiskLevel.HIGH);
        transfer.transitionTo(TransactionStatus.BLOCKED_STEP_UP_REQUIRED);
        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(source));
        when(transactions.findByTransactionIdAndFromAccountIdForUpdate(eq(transfer.getTransactionId()), eq("account-a")))
                .thenReturn(Optional.of(transfer));
        when(stepUpChallenges.consumeVerifiedChallenge(eq(transfer.getTransactionId()), eq("user-a")))
                .thenThrow(new FraudDetectedException("Additional authentication is required"));

        assertThatThrownBy(() -> service.confirmTransfer(
                new ConfirmTransferRequest(transfer.getTransactionId(), true), userA))
                .isInstanceOf(com.passwordlessauth.banking.exceptions.FraudDetectedException.class);
    }

    @Test
    void initiateHighRiskTransferCreatesStepUpChallenge() {
        Account source = account("account-a", "user-a", "100.00");
        Account destination = account("account-b", "user-b", "0.00");
        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(source));
        when(accounts.findByUserId("user-b")).thenReturn(Optional.of(destination));
        when(risk.assessRisk("user-a", new BigDecimal("10.00"), "user-b")).thenReturn(RiskLevel.HIGH);
        when(transactions.save(any(BankTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        StepUpChallenge challenge = org.mockito.Mockito.mock(StepUpChallenge.class);
        when(challenge.getChallengeId()).thenReturn("challenge-123");
        when(challenge.getRequiredAuthStrength()).thenReturn(RequiredAuthStrength.STRONG);
        when(stepUpChallenges.createChallenge(eq("user-a"), any(), eq(RequiredAuthStrength.STRONG))).thenReturn(challenge);

        var response = service.initiateTransfer(new TransferRequest("user-b", new BigDecimal("10.00"), null), userA);

        assertThat(response.getStatus()).isEqualTo(TransactionStatus.BLOCKED_STEP_UP_REQUIRED);
        assertThat(response.isStepUpRequired()).isTrue();
        assertThat(response.getStepUpChallengeId()).isEqualTo("challenge-123");
        assertThat(response.getRequiredAuthStrength()).isEqualTo(RequiredAuthStrength.STRONG);
    }

    @Test
    void terminalTransfersAreIdempotentAndStateMachineRejectsReplay() {
        BankTransaction transfer = BankTransaction.create("account-a", "account-b", new BigDecimal("10.00"), null, RiskLevel.LOW);
        transfer.transitionTo(TransactionStatus.COMPLETED);
        when(accounts.findByUserIdForUpdate("user-a")).thenReturn(Optional.of(account("account-a", "user-a", "100.00")));
        when(transactions.findByTransactionIdAndFromAccountIdForUpdate(eq(transfer.getTransactionId()), eq("account-a")))
                .thenReturn(Optional.of(transfer));

        assertThat(service.confirmTransfer(new ConfirmTransferRequest(transfer.getTransactionId(), true), userA).getStatus())
                .isEqualTo(TransactionStatus.COMPLETED);
        assertThatThrownBy(() -> transfer.transitionTo(TransactionStatus.COMPLETED))
                .isInstanceOf(IllegalStateException.class);
    }

    private Account account(String accountId, String userId, String balance) {
        return Account.builder().accountId(accountId).userId(userId).balance(new BigDecimal(balance)).build();
    }
}
