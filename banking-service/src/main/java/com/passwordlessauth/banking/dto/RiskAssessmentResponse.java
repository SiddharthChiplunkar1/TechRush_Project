package com.passwordlessauth.banking.dto;

import com.passwordlessauth.banking.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponse {

    /**
     * Risk level returned by the Auth Service risk engine.
     *
     * Expected values:
     * LOW, MEDIUM, HIGH
     */
    private RiskLevel riskLevel;

    /**
     * Optional human-readable explanation.
     *
     * This should never contain sensitive information or internal
     * security rules when returned outside the service boundary.
     */
    private String message;
}