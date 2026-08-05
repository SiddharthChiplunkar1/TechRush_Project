package com.passwordlessauth.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TransferRequest(
        @NotBlank String payeeName,
        @NotBlank String payeeAccount,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {}