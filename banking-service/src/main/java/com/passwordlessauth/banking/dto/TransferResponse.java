package com.passwordlessauth.banking.dto;

import java.math.BigDecimal;

public record TransferResponse(
        String status,
        BigDecimal newBalance,
        String message
) {}