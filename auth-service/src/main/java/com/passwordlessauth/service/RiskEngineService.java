package com.passwordlessauth.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.DeviceRepository;
import com.passwordlessauth.repository.LoginHistoryRepository;
import com.passwordlessauth.enums.LoginStatus;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Risk Engine — evaluates the risk level of each authentication attempt.
 *
 * Risk assessment algorithm:
 * The engine evaluates multiple signals and returns a risk level:
 *   - LOW:      Known trusted device, no recent failures, normal patterns
 *   - MEDIUM:   New device, or minor anomaly detected
 *   - HIGH:     Multiple recent failures, blocked account, or suspicious pattern
 *   - CRITICAL: Threshold exceeded, account should be locked
 *
 * This implements a simplified version of adaptive authentication.
 * In production, add geo-IP lookups, velocity checks, and ML scoring.
 */
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

    // ─── Risk Assessment ─────────────────────────────────────────────────────

    /**
     * Assesses the risk of a login attempt for the given user and request context.
     *
     * @param user    the user attempting to log in (may be null for first-time registrations)
     * @param request the HTTP request (for IP, User-Agent)
     * @return RiskLevel representing the assessed threat level
     */
    @Transactional(readOnly = true)
    public RiskLevel assessRisk(User user, HttpServletRequest request) {
        if (user == null) {
            // Unknown user — return MEDIUM (could be registration probe)
            return RiskLevel.MEDIUM;
        }

        // Check: Account locked
        if (!user.isAccountNonLocked()) {
            LocalDateTime lockedUntil = user.getLockedUntil();
            if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
                log.warn("Login attempt on locked account for user {}", maskId(user.getUserId()));
                return RiskLevel.CRITICAL;
            }
        }

        // Check: Failed attempts exceed critical threshold
        if (user.getFailedLoginAttempts() >= CRITICAL_RISK_FAILURE_COUNT) {
            return RiskLevel.CRITICAL;
        }

        // Check: Recent failed attempts in 30-minute window
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(RECENT_FAILURE_WINDOW_MINUTES);
        long recentFailures = loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                user.getUserId(), LoginStatus.FAILED, windowStart);

        if (recentFailures >= HIGH_RISK_FAILURE_COUNT) {
            log.info("High risk: {} failures in {}min for user {}",
                    recentFailures, RECENT_FAILURE_WINDOW_MINUTES, maskId(user.getUserId()));
            return RiskLevel.HIGH;
        }

        if (recentFailures > 0) {
            return RiskLevel.MEDIUM;
        }

        // Check: New device (not seen before for this user)
        boolean isNewDevice = !isKnownDevice(user, request);
        if (isNewDevice) {
            log.info("New device detected for user {}", maskId(user.getUserId()));
            return RiskLevel.MEDIUM;
        }

        // Check: Trusted device with clean history
        boolean isTrusted = deviceService.isTrustedDevice(user, request);
        if (isTrusted && recentFailures == 0) {
            return RiskLevel.LOW;
        }

        // Default: MEDIUM for any unclassified case
        return RiskLevel.MEDIUM;
    }

    /**
     * Determines if step-up authentication is required for the given risk level.
     * STRONG auth is required for MEDIUM risk and above.
     */
    public boolean requiresStepUp(RiskLevel riskLevel) {
        return riskLevel == RiskLevel.MEDIUM
            || riskLevel == RiskLevel.HIGH
            || riskLevel == RiskLevel.CRITICAL;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private boolean isKnownDevice(User user, HttpServletRequest request) {
        String fingerprint = deviceService.computeFingerprint(request);
        return deviceRepository.findByUserAndFingerprint(user, fingerprint).isPresent();
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }
}
