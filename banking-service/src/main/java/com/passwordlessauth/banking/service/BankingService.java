package com.passwordlessauth.banking.service;

import com.passwordlessauth.banking.dto.*;
import com.passwordlessauth.banking.entity.Account;
import com.passwordlessauth.banking.entity.BankTransaction;
import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.InsufficientFundsException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.AccountRepository;
import com.passwordlessauth.banking.repository.TransactionRepository;
import com.passwordlessauth.banking.client.NotificationClient;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BankingService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    // simple demo threshold for fraud
    private static final BigDecimal FRAUD_THRESHOLD = new BigDecimal("10000");

    @Autowired(required = false)
    private NotificationClient notificationClient;

    public BankingService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public BalanceResponse getBalanceForUser(String userId) {
        Account account = accountRepository.findByUserId(userId)
                .orElseGet(() -> createDemoAccountForUser(userId));
        return new BalanceResponse(userId, account.getBalance());
    }

    private Account createDemoAccountForUser(String userId) {
        Account a = new Account();
        a.setUserId(userId);
        a.setBalance(new BigDecimal("1000.00")); // demo seed
        return accountRepository.save(a);
    }

    @Transactional
    public TransferResponse initiateTransfer(TransferRequest req) {
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        if (req.getAmount().compareTo(FRAUD_THRESHOLD) > 0) {
            throw new FraudDetectedException("Transfer exceeds allowed limit and is flagged as fraud.");
        }

        Account from = accountRepository.findByUserId(req.getFromUserId())
                .orElseThrow(() -> new NotFoundException("Source account not found"));
        Account to = accountRepository.findByUserId(req.getToUserId())
                .orElseGet(() -> createDemoAccountForUser(req.getToUserId()));

        if (from.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }

        // create a pending transaction
        BankTransaction tx = new BankTransaction();
        tx.setFromAccountId(from.getAccountId());
        tx.setToAccountId(to.getAccountId());
        tx.setAmount(req.getAmount());
        tx.setStatus("PENDING");
        transactionRepository.save(tx);

        return new TransferResponse(tx.getTransactionId(), tx.getStatus());
    }

    @Transactional
    public TransferResponse confirmTransfer(ConfirmTransferRequest req) {
        BankTransaction tx = transactionRepository.findById(req.getTransferId())
                .orElseThrow(() -> new NotFoundException("Transfer not found"));

        if (!"PENDING".equals(tx.getStatus())) {
            return new TransferResponse(tx.getTransactionId(), tx.getStatus());
        }

        if (!req.isConfirm()) {
            tx.setStatus("FAILED");
            transactionRepository.save(tx);
            return new TransferResponse(tx.getTransactionId(), tx.getStatus());
        }

        // perform debit/credit
        Account from = accountRepository.findById(tx.getFromAccountId())
                .orElseThrow(() -> new NotFoundException("Source account not found"));
        Account to = accountRepository.findById(tx.getToAccountId())
                .orElseThrow(() -> new NotFoundException("Destination account not found"));

        if (from.getBalance().compareTo(tx.getAmount()) < 0) {
            tx.setStatus("FAILED");
            transactionRepository.save(tx);
            throw new InsufficientFundsException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(tx.getAmount()));
        to.setBalance(to.getBalance().add(tx.getAmount()));

        accountRepository.save(from);
        accountRepository.save(to);

        tx.setStatus("COMPLETED");
        transactionRepository.save(tx);

        // Notify users about completed transaction (best-effort)
        try {
            if (notificationClient != null) {
                notificationClient.notifyUser(from.getUserId(), "TRANSFER_COMPLETED",
                        "Your transfer of " + tx.getAmount() + " has been completed.");
                notificationClient.notifyUser(to.getUserId(), "TRANSFER_RECEIVED",
                        "You have received " + tx.getAmount() + " from " + from.getUserId() + ".");
            }
        } catch (Exception ignored) {}

        return new TransferResponse(tx.getTransactionId(), tx.getStatus());
    }

    public List<TransactionDto> getTransactionsForUser(String userId) {
        Account account = accountRepository.findByUserId(userId)
                .orElseGet(() -> createDemoAccountForUser(userId));
        List<BankTransaction> records = transactionRepository.findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(
                account.getAccountId(), account.getAccountId());
        return records.stream().map(r -> {
            TransactionDto d = new TransactionDto();
            d.setTransactionId(r.getTransactionId());
            d.setFromAccountId(r.getFromAccountId());
            d.setToAccountId(r.getToAccountId());
            d.setAmount(r.getAmount());
            d.setStatus(r.getStatus());
            d.setCreatedAt(r.getCreatedAt());
            return d;
        }).collect(Collectors.toList());
    }
}
