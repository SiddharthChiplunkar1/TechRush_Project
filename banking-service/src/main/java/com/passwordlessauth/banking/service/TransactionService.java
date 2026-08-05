package com.passwordlessauth.banking.service;

import com.passwordlessauth.banking.dto.BlockedTransfersResponse;
import com.passwordlessauth.banking.dto.TransferRequest;
import com.passwordlessauth.banking.dto.TransferResponse;
import com.passwordlessauth.banking.entity.Account;
import com.passwordlessauth.banking.entity.Transaction;
import com.passwordlessauth.banking.enums.TransactionStatus;
import com.passwordlessauth.banking.repository.AccountRepository;
import com.passwordlessauth.banking.repository.TransactionRepository;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private static final BigDecimal STEP_UP_THRESHOLD = BigDecimal.valueOf(5000);

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Account getOrCreateAccount(String userId, String email) {
        return accountRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Account account = new Account();
                    account.setUserId(userId);
                    account.setUserEmail(email);
                    account.setBalance(BigDecimal.valueOf(10000.00));
                    return accountRepository.save(account);
                });
    }

    @Transactional
    public TransferResponse processTransfer(AuthenticatedUser authUser,
                                            TransferRequest request,
                                            boolean isConfirm) {

        Account account = getOrCreateAccount(authUser.userId(), authUser.email());

        if (isConfirm) {
            if (!authUser.isStrongAuth()) {
                return new TransferResponse("FAILED", account.getBalance(),
                        "Strong authentication required for confirmation");
            }
            return executeTransfer(account, request);
        }

        boolean requiresStepUp = request.amount().compareTo(STEP_UP_THRESHOLD) >= 0
                || authUser.isWeakAuth();

        if (requiresStepUp) {
            Transaction blockedTx = new Transaction();
            blockedTx.setUserId(authUser.userId());
            blockedTx.setUserEmail(authUser.email());
            blockedTx.setPayeeName(request.payeeName());
            blockedTx.setPayeeAccount(request.payeeAccount());
            blockedTx.setAmount(request.amount());
            blockedTx.setStatus(TransactionStatus.BLOCKED_STEP_UP_REQUIRED);
            transactionRepository.save(blockedTx);

            return new TransferResponse("BLOCKED_STEP_UP_REQUIRED", account.getBalance(),
                    "Transfer requires step-up authentication. Amount >= 5000 or authLevel is WEAK.");
        }

        return executeTransfer(account, request);
    }

    private TransferResponse executeTransfer(Account account, TransferRequest request) {
        if (account.getBalance().compareTo(request.amount()) < 0) {
            Transaction failedTx = new Transaction();
            failedTx.setUserId(account.getUserId());
            failedTx.setUserEmail(account.getUserEmail());
            failedTx.setPayeeName(request.payeeName());
            failedTx.setPayeeAccount(request.payeeAccount());
            failedTx.setAmount(request.amount());
            failedTx.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(failedTx);

            return new TransferResponse("FAILED", account.getBalance(), "Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(request.amount()));
        accountRepository.save(account);

        Transaction completedTx = new Transaction();
        completedTx.setUserId(account.getUserId());
        completedTx.setUserEmail(account.getUserEmail());
        completedTx.setPayeeName(request.payeeName());
        completedTx.setPayeeAccount(request.payeeAccount());
        completedTx.setAmount(request.amount());
        completedTx.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(completedTx);

        return new TransferResponse("COMPLETED", account.getBalance(), "Transfer completed successfully");
    }

    public List<Transaction> getTransactionHistory(String userId) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public BlockedTransfersResponse getBlockedTransfers24h() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        long count = transactionRepository.countByStatusAndTimestampSince(
                TransactionStatus.BLOCKED_STEP_UP_REQUIRED, twentyFourHoursAgo);
        return new BlockedTransfersResponse(count);
    }
}