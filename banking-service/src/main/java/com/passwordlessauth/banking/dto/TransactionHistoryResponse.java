package com.passwordlessauth.banking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(
        String payeeName,
        String payeeAccount,
        BigDecimal amount,
        String status,
        LocalDateTime timestamp
) {}