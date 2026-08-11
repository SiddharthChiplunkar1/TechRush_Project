package com.passwordlessauth.controller;

import java.math.BigDecimal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.UserRepository;
import com.passwordlessauth.service.RiskEngineService;

import lombok.RequiredArgsConstructor;

/** Service-to-service risk assessment endpoint; protected by InternalServiceTokenFilter. */
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalRiskController {

    private final UserRepository userRepository;
    private final RiskEngineService riskEngineService;

    @PostMapping("/risk")
    public ResponseEntity<RiskAssessmentResponse> assessRisk(
            @Valid @RequestBody RiskAssessmentRequest request) {
        User user = userRepository.findById(request.userId()).orElse(null);
        RiskLevel riskLevel = user == null
                ? RiskLevel.HIGH
                : riskEngineService.assessRisk(user, null);

        return ResponseEntity.ok(new RiskAssessmentResponse(
                riskLevel,
                riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL
                        ? "Additional verification required"
                        : "Risk assessment completed"));
    }

    private record RiskAssessmentRequest(
            @NotBlank @Size(max = 100) String userId,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotBlank @Size(max = 100) String beneficiaryId) {
    }

    private record RiskAssessmentResponse(RiskLevel riskLevel, String message) {
    }
}
