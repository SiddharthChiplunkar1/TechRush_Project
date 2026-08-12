package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.BalanceResponse;
import com.passwordlessauth.banking.dto.ConfirmTransferRequest;
import com.passwordlessauth.banking.dto.TransactionDto;
import com.passwordlessauth.banking.dto.TransferRequest;
import com.passwordlessauth.banking.dto.TransferResponse;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import com.passwordlessauth.banking.service.BankingService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banking")
public class BankingController {

    private final BankingService bankingService;

    public BankingController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @GetMapping("/balance")
    public ResponseEntity<BalanceResponse> getBalance(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(
                bankingService.getBalanceForUser(user.userId())
        );
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> initiateTransfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(
                bankingService.initiateTransfer(request, user)
        );
    }

    @PostMapping("/transfer/otp/request")
    public ResponseEntity<Void> requestTransferOtp(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        bankingService.requestTransferOtp(user.userId());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/transfer/confirm")
    public ResponseEntity<TransferResponse> confirmTransfer(
            @Valid @RequestBody ConfirmTransferRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(
                bankingService.confirmTransfer(
                        request,
                        user
                )
        );
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactions(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                bankingService.getTransactionsForUser(
                        user.userId(),
                        page,
                        size
                )
        );
    }
}
