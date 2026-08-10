package com.passwordlessauth.banking.dto;

import com.passwordlessauth.banking.enums.RequiredAuthStrength;
import com.passwordlessauth.banking.enums.StepUpChallengeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StepUpChallengeResponse {
    private String challengeId;
    private String transactionId;
    private StepUpChallengeStatus status;
    private RequiredAuthStrength requiredAuthStrength;
    private Instant expiresAt;
    private Instant verifiedAt;
    private Instant consumedAt;
}
