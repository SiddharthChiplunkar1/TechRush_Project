package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.*;
import com.passwordlessauth.banking.service.BankingService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<BalanceResponse> getBalance(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(bankingService.getBalanceForUser(userId));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(@RequestBody TransferRequest request) {
        return ResponseEntity.ok(bankingService.initiateTransfer(request));
    }

    @PostMapping("/transfer/confirm")
    public ResponseEntity<TransferResponse> confirm(@RequestBody ConfirmTransferRequest request) {
        return ResponseEntity.ok(bankingService.confirmTransfer(request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> transactions(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(bankingService.getTransactionsForUser(userId));
    }
}
