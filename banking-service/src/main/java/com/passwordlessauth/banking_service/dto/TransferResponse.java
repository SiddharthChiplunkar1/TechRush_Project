package com.passwordlessauth.banking_service.dto;

import com.passwordlessauth.banking_service.enums.TransactionStatus;
import java.math.BigDecimal;

public record TransferResponse(
        String transactionId,
        TransactionStatus status,
        BigDecimal newBalance,
        String message
) {}