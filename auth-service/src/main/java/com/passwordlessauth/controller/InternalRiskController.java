package com.passwordlessauth.controller;

import java.math.BigDecimal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.UserRepository;
import com.passwordlessauth.service.RiskEngineService;
import com.passwordlessauth.service.OtpService;

import lombok.RequiredArgsConstructor;

/** Service-to-service risk assessment endpoint; protected by InternalServiceTokenFilter. */
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class InternalRiskController {

    private final UserRepository userRepository;
    private final RiskEngineService riskEngineService;
    private final OtpService otpService;

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

    @GetMapping("/users/resolve")
    public ResponseEntity<UserLookupResponse> resolveUser(
            @RequestParam("email") String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null || !user.isEmailVerified()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserLookupResponse(user.getUserId()));
    }

    @PostMapping("/transfer/step-up/request")
    public ResponseEntity<Void> requestTransferStepUpOtp(
            @Valid @RequestBody UserIdRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        otpService.generateAndSendTransferStepUpOtp(user);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/transfer/step-up/verify")
    public ResponseEntity<Void> verifyTransferStepUpOtp(
            @Valid @RequestBody TransferOtpRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        otpService.verifyOtp(user.getEmail(), request.otp(), "TRANSFER_STEP_UP");
        return ResponseEntity.noContent().build();
    }

    private record RiskAssessmentRequest(
            @NotBlank @Size(max = 100) String userId,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotBlank @Size(max = 100) String beneficiaryId) {
    }

    private record RiskAssessmentResponse(RiskLevel riskLevel, String message) {
    }

    private record UserLookupResponse(String userId) {
    }

    private record UserIdRequest(@NotBlank @Size(max = 100) String userId) {
    }

    private record TransferOtpRequest(
            @NotBlank @Size(max = 100) String userId,
            @NotBlank @Size(min = 6, max = 6) String otp) {
    }
}
