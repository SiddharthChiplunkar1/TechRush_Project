package com.passwordlessauth.banking.service;

import com.passwordlessauth.banking.client.NotificationClient;
import com.passwordlessauth.banking.client.RiskClient;
import com.passwordlessauth.banking.dto.BalanceResponse;
import com.passwordlessauth.banking.dto.ConfirmTransferRequest;
import com.passwordlessauth.banking.dto.TransactionDto;
import com.passwordlessauth.banking.dto.TransferRequest;
import com.passwordlessauth.banking.dto.TransferResponse;
import com.passwordlessauth.banking.entity.Account;
import com.passwordlessauth.banking.entity.BankTransaction;
import com.passwordlessauth.banking.enums.RiskLevel;
import com.passwordlessauth.banking.enums.TransactionStatus;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.InsufficientFundsException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.AccountRepository;
import com.passwordlessauth.banking.repository.TransactionRepository;
import com.passwordlessauth.banking.security.AuthenticatedUser;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@Slf4j
public class BankingService {

    private static final int DEFAULT_TRANSACTION_PAGE_SIZE = 20;
    private static final int MAX_TRANSACTION_PAGE_SIZE = 100;

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationClient notificationClient;
    private final RiskClient riskClient;

    /**
     * Development-only configuration.
     *
     * Keep this at zero in production.
     */
    @Value("${banking.demo.balance:0.00}")
    private BigDecimal demoInitialBalance;

    /**
     * Account auto-creation is disabled by default.
     */
    @Value("${banking.demo.auto-create-accounts:false}")
    private boolean autoCreateAccounts;

    public BankingService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            NotificationClient notificationClient,
            RiskClient riskClient
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.notificationClient = notificationClient;
        this.riskClient = riskClient;
    }

    /**
     * Returns the authenticated user's balance.
     *
     * The userId must originate from the authenticated JWT,
     * never from a request parameter.
     */
    @Transactional
    public BalanceResponse getBalanceForUser(String userId) {

        requireUserId(userId);

        Account account = accountRepository
                .findByUserId(userId)
                .orElseGet(() -> getOrCreateAccount(userId));

        return new BalanceResponse(
                account.getBalance()
        );
    }

    /**
     * Initiates a transfer.
     *
     * The source user is ALWAYS taken from the authenticated
     * security principal. The client cannot supply it.
     */
    @Transactional
    public TransferResponse initiateTransfer(
            TransferRequest request,
            AuthenticatedUser authenticatedUser
    ) {

        validateTransferRequest(request);

        if (authenticatedUser == null) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        String senderId = authenticatedUser.userId();

        requireUserId(senderId);

        String recipientId = request.getToUserId().trim();

        if (senderId.equals(recipientId)) {
            throw new IllegalArgumentException(
                    "Cannot transfer to yourself"
            );
        }

        /*
         * Lock the sender's account.
         *
         * The account must already exist for a financial operation.
         */
        Account sourceAccount = accountRepository
                .findByUserIdForUpdate(senderId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Source account not found"
                        )
                );

        /*
         * Resolve the destination account from the recipient.
         *
         * Do not automatically create financial accounts here.
         */
        Account destinationAccount = accountRepository
                .findByUserId(recipientId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Destination account not found"
                        )
                );

        /*
         * Check balance before creating the transfer.
         */
        ensureSufficientFunds(
                sourceAccount,
                request.getAmount()
        );

        /*
         * Ask the risk engine to evaluate the transfer.
         */
        RiskLevel riskLevel = riskClient.assessRisk(
                senderId,
                request.getAmount(),
                recipientId
        );

        /*
         * Fail closed if the risk engine cannot provide a decision.
         */
        if (riskLevel == null) {
            log.error(
                    "Risk assessment unavailable for transfer. userId={}",
                    senderId
            );

            throw new FraudDetectedException(
                    "Unable to evaluate transaction risk"
            );
        }

        BankTransaction transaction = BankTransaction.create(
                sourceAccount.getAccountId(),
                destinationAccount.getAccountId(),
                request.getAmount(),
                sanitizeDescription(
                        request.getDescription()
                ),
                riskLevel
        );

        /*
         * HIGH and CRITICAL transactions require step-up
         * authentication before confirmation.
         */
        if (riskLevel == RiskLevel.HIGH
                || riskLevel == RiskLevel.CRITICAL) {

            transaction.setStatus(
                    TransactionStatus.BLOCKED_STEP_UP_REQUIRED
            );

            log.warn(
                    "High-risk transfer requires step-up. userId={}",
                    senderId
            );

        } else {

            transaction.setStatus(
                    TransactionStatus.PENDING
            );
        }

        BankTransaction saved =
                transactionRepository.save(transaction);

        return new TransferResponse(
                saved.getTransactionId(),
                saved.getStatus()
        );
    }

    /**
     * Confirms or cancels a transfer.
     *
     * The authenticated user must own the source account.
     */
    @Transactional
    public TransferResponse confirmTransfer(
            ConfirmTransferRequest request,
            AuthenticatedUser authenticatedUser
    ) {

        validateConfirmRequest(request);

        if (authenticatedUser == null) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        String userId = authenticatedUser.userId();

        requireUserId(userId);

        /*
         * Lock the authenticated user's source account.
         */
        Account sourceAccount = accountRepository
                .findByUserIdForUpdate(userId)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Source account not found"
                        )
                );

        /*
         * Lock the transfer and simultaneously verify that
         * it belongs to the authenticated user's account.
         *
         * This prevents transaction IDOR.
         */
        BankTransaction transaction =
                transactionRepository
                        .findByTransactionIdAndFromAccountIdForUpdate(
                                request.getTransferId(),
                                sourceAccount.getAccountId()
                        )
                        .orElseThrow(() ->
                                new NotFoundException(
                                        "Transfer not found"
                                )
                        );

        /*
         * Terminal operations are idempotent.
         */
        if (transaction.getStatus()
                == TransactionStatus.COMPLETED
                || transaction.getStatus()
                == TransactionStatus.FAILED) {

            return new TransferResponse(
                    transaction.getTransactionId(),
                    transaction.getStatus()
            );
        }

        /*
         * HIGH / CRITICAL transactions require strong
         * authentication before money can move.
         */
        if (transaction.getStatus()
                == TransactionStatus.BLOCKED_STEP_UP_REQUIRED
                && !authenticatedUser.isStrongAuth()) {

            throw new FraudDetectedException(
                    "Additional authentication is required"
            );
        }

        /*
         * Cancellation does not move money.
         */
        if (!request.isConfirm()) {

            transaction.setStatus(
                    TransactionStatus.FAILED
            );

            transactionRepository.save(transaction);

            log.info(
                    "Transfer cancelled. userId={}",
                    userId
            );

            return new TransferResponse(
                    transaction.getTransactionId(),
                    transaction.getStatus()
            );
        }

        /*
         * Lock destination account before moving money.
         */
        Account destinationAccount =
                accountRepository
                        .findByAccountIdForUpdate(
                                transaction.getToAccountId()
                        )
                        .orElseThrow(() ->
                                new NotFoundException(
                                        "Destination account not found"
                                )
                        );

        /*
         * Re-check the balance immediately before the
         * financial operation.
         */
        ensureSufficientFunds(
                sourceAccount,
                transaction.getAmount()
        );

        if (transaction.getAmount().signum() <= 0) {
            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero"
            );
        }

        /*
         * Perform atomic debit/credit.
         *
         * @Transactional ensures that either ALL changes commit
         * or ALL changes roll back.
         */
        sourceAccount.debit(transaction.getAmount());
        destinationAccount.credit(transaction.getAmount());

        transaction.setStatus(
                TransactionStatus.COMPLETED
        );

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);
        transactionRepository.save(transaction);

        log.info(
                "Transfer completed. userId={}",
                userId
        );

        /*
         * Notification failure must never roll back a completed
         * financial transaction.
         */
        sendTransferNotifications(
                transaction,
                sourceAccount,
                destinationAccount
        );

        return new TransferResponse(
                transaction.getTransactionId(),
                transaction.getStatus()
        );
    }

    /**
     * Returns paginated transaction history.
     */
    @Transactional
    public List<TransactionDto> getTransactionsForUser(
            String userId,
            int page,
            int size
    ) {

        requireUserId(userId);

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page must not be negative"
            );
        }

        int safeSize = Math.min(
                Math.max(size, 1),
                MAX_TRANSACTION_PAGE_SIZE
        );

        Account account = accountRepository
                .findByUserId(userId)
                .orElseGet(() -> getOrCreateAccount(userId));

        List<BankTransaction> records =
                transactionRepository.findByAccountId(
                        account.getAccountId(),
                        PageRequest.of(page, safeSize)
                );

        return records.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Backwards-compatible method for existing callers.
     */
    @Transactional
    public List<TransactionDto> getTransactionsForUser(
            String userId
    ) {
        return getTransactionsForUser(
                userId,
                0,
                DEFAULT_TRANSACTION_PAGE_SIZE
        );
    }

    /**
     * Creates an account only when explicitly enabled.
     *
     * This should be disabled in production.
     */
    private Account getOrCreateAccount(String userId) {

        requireUserId(userId);

        if (!autoCreateAccounts) {
            throw new NotFoundException(
                    "Banking account not found"
            );
        }

        Account account = Account.builder()
                .userId(userId)
                .balance(demoInitialBalance)
                .build();

        log.info(
                "Created development banking account for userId={}",
                userId
        );

        return accountRepository.save(account);
    }

    private void validateTransferRequest(
            TransferRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Transfer request is required"
            );
        }

        if (request.getToUserId() == null
                || request.getToUserId().isBlank()) {

            throw new IllegalArgumentException(
                    "Recipient is required"
            );
        }

        if (request.getAmount() == null) {
            throw new IllegalArgumentException(
                    "Amount is required"
            );
        }

        if (request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        if (request.getAmount().scale() > 2) {
            throw new IllegalArgumentException(
                    "Amount cannot contain more than 2 decimal places"
            );
        }

        if (request.getAmount().precision() > 19) {
            throw new IllegalArgumentException(
                    "Amount is too large"
            );
        }
    }

    private void validateConfirmRequest(
            ConfirmTransferRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Transfer confirmation request is required"
            );
        }

        if (request.getTransferId() == null
                || request.getTransferId().isBlank()) {

            throw new IllegalArgumentException(
                    "Transfer ID is required"
            );
        }
    }

    private void ensureSufficientFunds(
            Account account,
            BigDecimal amount
    ) {

        if (account.getBalance() == null) {
            throw new IllegalStateException(
                    "Account balance is invalid"
            );
        }

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Invalid transaction amount"
            );
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient balance"
            );
        }
    }

    private String sanitizeDescription(
            String description
    ) {

        if (description == null) {
            return null;
        }

        String value = description.trim();

        if (value.isBlank()) {
            return null;
        }

        /*
         * TransferRequest currently limits this to 255 characters.
         */
        if (value.length() > 255) {
            throw new IllegalArgumentException(
                    "Description must not exceed 255 characters"
            );
        }

        return value;
    }

    private void sendTransferNotifications(
            BankTransaction transaction,
            Account sourceAccount,
            Account destinationAccount
    ) {

        try {

            notificationClient.notifyUser(
                    sourceAccount.getUserId(),
                    "TRANSFER_COMPLETED",
                    "Your transfer has been completed."
            );

            notificationClient.notifyUser(
                    destinationAccount.getUserId(),
                    "TRANSFER_RECEIVED",
                    "You have received a transfer."
            );

        } catch (Exception exception) {

            /*
             * The financial transaction has already been persisted.
             * Notification failure must not change its status.
             */
            log.warn(
                    "Transfer notification failed. transactionId={}",
                    transaction.getTransactionId()
            );
        }
    }

    private void requireUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user ID is required"
            );
        }

        if (userId.length() > 100) {
            throw new IllegalArgumentException(
                    "Invalid user ID"
            );
        }
    }

    private TransactionDto toDto(
            BankTransaction transaction
    ) {

        TransactionDto dto =
                new TransactionDto();

        dto.setTransactionId(
                transaction.getTransactionId()
        );

        dto.setFromAccountId(
                transaction.getFromAccountId()
        );

        dto.setToAccountId(
                transaction.getToAccountId()
        );

        dto.setAmount(
                transaction.getAmount()
        );

        dto.setStatus(
                transaction.getStatus().name()
        );

        dto.setCreatedAt(
                transaction.getCreatedAt()
        );

        dto.setDescription(
                transaction.getDescription()
        );

        dto.setRiskLevel(
                transaction.getRiskLevel() != null
                        ? transaction.getRiskLevel().name()
                        : null
        );

        return dto;
    }
}
