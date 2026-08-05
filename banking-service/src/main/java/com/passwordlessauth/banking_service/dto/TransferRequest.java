package com.passwordlessauth.banking_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record TransferRequest(
        @NotBlank String payeeName,
        @NotBlank String payeeAccount,
        @Positive BigDecimal amount
) {}