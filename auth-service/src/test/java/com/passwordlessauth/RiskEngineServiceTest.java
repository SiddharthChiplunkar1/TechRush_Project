package com.passwordlessauth;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.DeviceRepository;
import com.passwordlessauth.repository.LoginHistoryRepository;
import com.passwordlessauth.service.DeviceService;
import com.passwordlessauth.service.RiskEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RiskEngineService.
 *
 * Verifies the four risk levels under different signal combinations:
 * - LOW:      trusted device, zero recent failures
 * - MEDIUM:   new/unknown device, or 1–4 recent failures
 * - HIGH:     5+ recent failures in 30-minute window
 * - CRITICAL: account locked, or 10+ failed login attempts
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RiskEngineServiceTest {

    @Mock private LoginHistoryRepository loginHistoryRepository;
    @Mock private DeviceRepository deviceRepository;
    @Mock private DeviceService deviceService;

    private RiskEngineService riskEngine;

    private User user;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        riskEngine = new RiskEngineService(loginHistoryRepository, deviceRepository, deviceService);
        ReflectionTestUtils.setField(riskEngine, "maxFailedAttempts", 10);

        user = new User();
        user.setUserId("u-42");
        user.setEmail("carol@example.com");
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);

        request = new MockHttpServletRequest();
        request.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0)");

        // Default fingerprint stub — device is known but not trusted
        when(deviceService.computeFingerprint(any())).thenReturn("fp-hash-abc");
        when(deviceRepository.findByUserAndFingerprint(any(), anyString()))
                .thenReturn(Optional.of(new com.passwordlessauth.entity.Device()));
    }

    // ─── CRITICAL ────────────────────────────────────────────────────────────

    @Test
    void assessRisk_lockedAccount_returnsCritical() {
        user.setAccountNonLocked(false);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.CRITICAL);
        // Should short-circuit — no DB calls needed for login history
        verifyNoInteractions(loginHistoryRepository);
    }

    @Test
    void assessRisk_failedAttemptsMeetCriticalThreshold_returnsCritical() {
        user.setFailedLoginAttempts(10); // equals CRITICAL_RISK_FAILURE_COUNT

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.CRITICAL);
    }

    // ─── HIGH ─────────────────────────────────────────────────────────────────

    @Test
    void assessRisk_fiveRecentFailuresInWindow_returnsHigh() {
        when(loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                eq("u-42"), eq(LoginStatus.FAILED), any()))
                .thenReturn(5L);

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.HIGH);
    }

    // ─── MEDIUM ───────────────────────────────────────────────────────────────

    @Test
    void assessRisk_oneRecentFailure_returnsMedium() {
        when(loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                anyString(), any(), any()))
                .thenReturn(1L);

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.MEDIUM);
    }

    @Test
    void assessRisk_unknownDevice_returnsMedium() {
        // Device not found → new device
        when(deviceRepository.findByUserAndFingerprint(any(), anyString()))
                .thenReturn(Optional.empty());
        when(loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                anyString(), any(), any()))
                .thenReturn(0L);

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.MEDIUM);
    }

    @Test
    void assessRisk_nullUser_returnsMedium() {
        RiskLevel risk = riskEngine.assessRisk(null, request);

        assertThat(risk).isEqualTo(RiskLevel.MEDIUM);
    }

    // ─── LOW ──────────────────────────────────────────────────────────────────

    @Test
    void assessRisk_trustedDeviceNoFailures_returnsLow() {
        when(loginHistoryRepository.countByUserUserIdAndStatusAndTimestampAfter(
                anyString(), any(), any()))
                .thenReturn(0L);
        when(deviceService.isTrustedDevice(any(), any())).thenReturn(true);

        RiskLevel risk = riskEngine.assessRisk(user, request);

        assertThat(risk).isEqualTo(RiskLevel.LOW);
    }

    // ─── requiresStepUp ───────────────────────────────────────────────────────

    @Test
    void requiresStepUp_lowRisk_returnsFalse() {
        assertThat(riskEngine.requiresStepUp(RiskLevel.LOW)).isFalse();
    }

    @Test
    void requiresStepUp_mediumAndAbove_returnsTrue() {
        assertThat(riskEngine.requiresStepUp(RiskLevel.MEDIUM)).isTrue();
        assertThat(riskEngine.requiresStepUp(RiskLevel.HIGH)).isTrue();
        assertThat(riskEngine.requiresStepUp(RiskLevel.CRITICAL)).isTrue();
    }
}
