package com.passwordlessauth.banking_service;

import com.passwordlessauth.banking_service.dto.BankingPrincipal;
import com.passwordlessauth.banking_service.dto.TransferRequest;
import com.passwordlessauth.banking_service.dto.TransferResponse;
import com.passwordlessauth.banking_service.entity.TransactionEntity;
import com.passwordlessauth.banking_service.service.BankingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banking")
@RequiredArgsConstructor
public class BankingController {

    private final BankingService bankingService;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "banking-service", "status", "up");
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance(Authentication auth) {
        BankingPrincipal principal = (BankingPrincipal) auth.getPrincipal();
        BigDecimal balance = bankingService.getBalance(principal.userId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(Authentication auth,
                                                       @Valid @RequestBody TransferRequest request) {
        BankingPrincipal principal = (BankingPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(bankingService.transfer(principal, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionEntity>> getHistory(Authentication auth) {
        BankingPrincipal principal = (BankingPrincipal) auth.getPrincipal();
        return ResponseEntity.ok(bankingService.getHistory(principal.userId()));
    }
}