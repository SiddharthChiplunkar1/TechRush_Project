package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.BalanceResponse;
import com.passwordlessauth.banking.dto.ConfirmTransferRequest;
import com.passwordlessauth.banking.dto.TransferRequest;
import com.passwordlessauth.banking.dto.TransferResponse;
import com.passwordlessauth.banking.dto.TransactionDto;
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
    public ResponseEntity<TransferResponse> initiateTransfer(@RequestBody TransferRequest req) {
        return ResponseEntity.ok(bankingService.initiateTransfer(req));
    }

    @PostMapping("/transfer/confirm")
    public ResponseEntity<TransferResponse> confirmTransfer(@RequestBody ConfirmTransferRequest req) {
        return ResponseEntity.ok(bankingService.confirmTransfer(req));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactions(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(bankingService.getTransactionsForUser(userId));
    }
}
