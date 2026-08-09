package com.passwordlessauth.banking.dto;

import com.passwordlessauth.banking.enums.TransactionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(

        @NotBlank(message = "Payee name is required")
        String payeeName,

        @NotBlank(message = "Payee account is required")
        String payeeAccount,

        @NotNull(message = "Transaction amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Transaction amount must be greater than zero"
        )
        BigDecimal amount,

        @NotNull(message = "Transaction status is required")
        TransactionStatus status,

        @NotNull(message = "Transaction timestamp is required")
        LocalDateTime timestamp

) {
}