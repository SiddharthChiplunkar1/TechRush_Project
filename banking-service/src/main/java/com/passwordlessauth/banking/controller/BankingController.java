package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.*;
import com.passwordlessauth.banking.entity.Account;
import com.passwordlessauth.banking.entity.Transaction;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import com.passwordlessauth.banking.service.TransactionService;
import com.passwordlessauth.banking.dto.BlockedTransfersResponse;
import com.passwordlessauth.banking.dto.TransactionHistoryResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@Slf4j
public class BankingController {

    private final TransactionService transactionService;

    public BankingController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/transactions/balance")
    public ResponseEntity<BalanceResponse> getBalance(@AuthenticationPrincipal AuthenticatedUser authUser) {
        Account account = transactionService.getOrCreateAccount(authUser.userId(), authUser.email());
        return ResponseEntity.ok(new BalanceResponse(account.getBalance()));
    }

    @PostMapping("/transactions/transfer")
    public ResponseEntity<TransferResponse> transfer(@AuthenticationPrincipal AuthenticatedUser authUser,
                                                     @Valid @RequestBody TransferRequest request) {
        TransferResponse response = transactionService.processTransfer(authUser, request, false);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transactions/transfer/confirm")
    public ResponseEntity<TransferResponse> confirmTransfer(@AuthenticationPrincipal AuthenticatedUser authUser,
                                                            @Valid @RequestBody TransferRequest request) {
        TransferResponse response = transactionService.processTransfer(authUser, request, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/history")
    public ResponseEntity<List<TransactionHistoryResponse>> getTransactionHistory(
            @AuthenticationPrincipal AuthenticatedUser authUser) {

        List<Transaction> transactions = transactionService.getTransactionHistory(authUser.userId());

        List<TransactionHistoryResponse> response = transactions.stream()
                .map(tx -> new TransactionHistoryResponse(
                        tx.getPayeeName(),
                        tx.getPayeeAccount(),
                        tx.getAmount(),
                        tx.getStatus().name(),
                        tx.getTimestamp()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/internal/stats/blocked-transfers-24h")
    public ResponseEntity<BlockedTransfersResponse> getBlockedTransfers24h() {
        BlockedTransfersResponse response = transactionService.getBlockedTransfers24h();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}