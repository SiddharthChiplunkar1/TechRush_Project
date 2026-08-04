package com.passwordlessauth.banking_service.dto;

import com.passwordlessauth.banking_service.enums.AuthLevel;

public record BankingPrincipal(String userId, String email, String role, AuthLevel authLevel) {}