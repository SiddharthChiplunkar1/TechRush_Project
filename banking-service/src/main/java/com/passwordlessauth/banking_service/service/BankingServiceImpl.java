package com.passwordlessauth.banking_service.service;

import com.passwordlessauth.banking_service.config.BankingProperties;
import com.passwordlessauth.banking_service.dto.BankingPrincipal;
import com.passwordlessauth.banking_service.dto.TransferRequest;
import com.passwordlessauth.banking_service.dto.TransferResponse;
import com.passwordlessauth.banking_service.entity.AccountEntity;
import com.passwordlessauth.banking_service.entity.TransactionEntity;
import com.passwordlessauth.banking_service.enums.TransactionStatus;
import com.passwordlessauth.banking_service.enums.AuthLevel;
import com.passwordlessauth.banking_service.exception.ApiException;
import com.passwordlessauth.banking_service.repository.AccountRepository;
import com.passwordlessauth.banking_service.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankingServiceImpl implements BankingService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BankingProperties bankingProperties;

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getBalance(String userId) {
        return getAccount(userId).getBalance();
    }

    @Override
    @Transactional
    public TransferResponse transfer(BankingPrincipal principal, TransferRequest request) {
        AccountEntity account = getAccount(principal.userId());

        boolean needsStepUp = request.amount().compareTo(bankingProperties.getStepUpThreshold()) > 0
                && principal.authLevel() == AuthLevel.WEAK;

        if (needsStepUp) {
            TransactionEntity blocked = new TransactionEntity();
            blocked.setUserId(principal.userId());
            blocked.setPayeeName(request.payeeName());
            blocked.setPayeeAccount(request.payeeAccount());
            blocked.setAmount(request.amount());
            blocked.setStatus(TransactionStatus.BLOCKED_STEP_UP_REQUIRED);
            transactionRepository.save(blocked);

            return new TransferResponse(
                    blocked.getTransactionId(),
                    TransactionStatus.BLOCKED_STEP_UP_REQUIRED,
                    account.getBalance(),
                    "Step-up authentication required for this amount"
            );
        }

        if (account.getBalance().compareTo(request.amount()) < 0) {
            throw new ApiException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(request.amount()));
        accountRepository.save(account);

        TransactionEntity completed = new TransactionEntity();
        completed.setUserId(principal.userId());
        completed.setPayeeName(request.payeeName());
        completed.setPayeeAccount(request.payeeAccount());
        completed.setAmount(request.amount());
        completed.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(completed);

        return new TransferResponse(
                completed.getTransactionId(),
                TransactionStatus.COMPLETED,
                account.getBalance(),
                "Transfer successful"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionEntity> getHistory(String userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private AccountEntity getAccount(String userId) {
        return accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Account not found for user: " + userId));
    }
}