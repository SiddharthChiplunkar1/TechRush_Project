package com.passwordlessauth.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.DeviceRepository;
import com.passwordlessauth.repository.LoginHistoryRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskEngineService {

    private static final int RECENT_FAILURE_WINDOW_MINUTES = 30;
    private static final int HIGH_RISK_FAILURE_COUNT = 5;
    private static final int CRITICAL_RISK_FAILURE_COUNT = 10;

    @Value("${app.security.max-failed-login-attempts:10}")
    private int maxFailedAttempts;

    private final LoginHistoryRepository loginHistoryRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;

    @Transactional(readOnly = true)
    public RiskLevel assessRisk(User user, HttpServletRequest request) {

        if (user == null) {
            return RiskLevel.MEDIUM;
        }

        if (!user.isAccountNonLocked()) {
            LocalDateTime lockedUntil = user.getLockedUntil();

            if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
                log.warn("Login attempt on locked account {}", maskId(user.getUserId()));
                return RiskLevel.CRITICAL;
            }
        }

        if (user.getFailedLoginAttempts() >= CRITICAL_RISK_FAILURE_COUNT) {
            return RiskLevel.CRITICAL;
        }

        LocalDateTime windowStart = LocalDateTime.now()
                .minusMinutes(RECENT_FAILURE_WINDOW_MINUTES);

        long recentFailures =
                loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                        user.getUserId(),
                        LoginStatus.FAILED,
                        windowStart);

        if (recentFailures >= HIGH_RISK_FAILURE_COUNT) {
            return RiskLevel.HIGH;
        }

        if (recentFailures > 0) {
            return RiskLevel.MEDIUM;
        }

        if (request == null) {
            return RiskLevel.LOW;
        }

        boolean knownDevice = isKnownDevice(user, request);

        if (!knownDevice) {
            log.info("New device detected for {}", maskId(user.getUserId()));
            return RiskLevel.MEDIUM;
        }

        boolean trustedDevice = deviceService.isTrustedDevice(user, request);

        if (trustedDevice) {
            return RiskLevel.LOW;
        }

        return RiskLevel.MEDIUM;
    }

    public boolean requiresStepUp(RiskLevel riskLevel) {
        return riskLevel == RiskLevel.MEDIUM
                || riskLevel == RiskLevel.HIGH
                || riskLevel == RiskLevel.CRITICAL;
    }

    private boolean isKnownDevice(User user, HttpServletRequest request) {

        if (request == null) {
            return false;
        }

        String fingerprint = deviceService.computeFingerprint(request);

        if (fingerprint == null || fingerprint.isBlank()) {
            return false;
        }

        return deviceRepository
                .findByUserAndFingerprint(user, fingerprint)
                .isPresent();
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) {
            return "***";
        }
        return id.substring(0, 4) + "...";
    }
}