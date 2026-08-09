package com.passwordlessauth.banking.client;

import com.passwordlessauth.banking.dto.RiskAssessmentRequest;
import com.passwordlessauth.banking.dto.RiskAssessmentResponse;
import com.passwordlessauth.banking.enums.RiskLevel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Objects;

@Component
public class RiskClient {

    private static final Logger log =
            LoggerFactory.getLogger(RiskClient.class);

    private final RestClient restClient;
    private final String authServiceUrl;

    public RiskClient(
            RestClient.Builder restClientBuilder,
            @Value("${auth.service.url:http://auth-service:8080}") String authServiceUrl
    ) {
        this.restClient = Objects.requireNonNull(
                restClientBuilder,
                "restClientBuilder must not be null"
        ).build();

        if (authServiceUrl == null || authServiceUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "auth.service.url must not be blank"
            );
        }

        this.authServiceUrl = authServiceUrl.replaceAll("/+$", "");
    }

    /**
     * Performs a risk assessment for a proposed banking transaction.
     *
     * SECURITY:
     * Failure to obtain a risk assessment is treated as HIGH risk.
     * This prevents the banking service from failing open when the
     * authentication/risk service is unavailable.
     */
    public RiskLevel assessRisk(
            String userId,
            BigDecimal amount,
            String beneficiaryId
    ) {

        validateUserId(userId);
        validateAmount(amount);
        validateBeneficiaryId(beneficiaryId);

        RiskAssessmentRequest request =
                new RiskAssessmentRequest(
                        userId,
                        amount,
                        beneficiaryId
                );

        try {

            RiskAssessmentResponse response =
                    restClient.post()
                            .uri(authServiceUrl + "/internal/risk")
                            .body(request)
                            .retrieve()
                            .body(RiskAssessmentResponse.class);

            if (response == null) {

                log.error(
                        "Risk assessment returned an empty response for user [{}]",
                        maskUserId(userId)
                );

                return RiskLevel.HIGH;
            }

            RiskLevel riskLevel = response.getRiskLevel();

            if (riskLevel == null) {

                log.error(
                        "Risk assessment returned no risk level for user [{}]",
                        maskUserId(userId)
                );

                return RiskLevel.HIGH;
            }

            log.debug(
                    "Risk assessment completed for user [{}]: {}",
                    maskUserId(userId),
                    riskLevel
            );

            return riskLevel;

        } catch (RestClientException ex) {

            /*
             * NEVER silently downgrade risk when the risk engine
             * cannot be reached.
             *
             * A banking system must fail secure.
             */
            log.error(
                    "Risk assessment service unavailable for user [{}]: {}",
                    maskUserId(userId),
                    ex.getClass().getSimpleName()
            );

            return RiskLevel.HIGH;
        }
    }

    private void validateUserId(String userId) {

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException(
                    "userId must not be null or blank"
            );
        }

        if (userId.length() > 128) {
            throw new IllegalArgumentException(
                    "userId exceeds the maximum allowed length"
            );
        }
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null) {
            throw new IllegalArgumentException(
                    "amount must not be null"
            );
        }

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "amount must be greater than zero"
            );
        }

        /*
         * Prevent unreasonable precision from entering the
         * risk-assessment service.
         *
         * The actual banking transfer validation must still happen
         * in BankingService.
         */
        if (amount.scale() > 2) {
            throw new IllegalArgumentException(
                    "amount must have at most two decimal places"
            );
        }
    }

    private void validateBeneficiaryId(String beneficiaryId) {

        if (beneficiaryId == null || beneficiaryId.isBlank()) {
            throw new IllegalArgumentException(
                    "beneficiaryId must not be null or blank"
            );
        }

        if (beneficiaryId.length() > 128) {
            throw new IllegalArgumentException(
                    "beneficiaryId exceeds the maximum allowed length"
            );
        }
    }

    /**
     * Prevent complete user identifiers from appearing in logs.
     */
    private String maskUserId(String userId) {

        if (userId == null || userId.length() <= 4) {
            return "****";
        }

        return "****" +
                userId.substring(userId.length() - 4);
    }
}
