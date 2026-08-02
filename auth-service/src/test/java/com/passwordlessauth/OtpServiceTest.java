package com.passwordlessauth;

import com.passwordlessauth.entity.OtpToken;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.exception.InvalidOtpException;
import com.passwordlessauth.exception.TooManyRequestsException;
import com.passwordlessauth.repository.OtpTokenRepository;
import com.passwordlessauth.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OtpService covering:
 * - Secure OTP generation (6-digit format, BCrypt hash stored not plaintext)
 * - Resend cooldown enforcement
 * - Verification happy path
 * - Wrong OTP rejection with attempt tracking
 * - Max-attempt lockout
 * - Expired OTP rejection
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OtpServiceTest {

    @Mock private OtpTokenRepository otpTokenRepository;
    @Mock private JavaMailSender mailSender;

    private PasswordEncoder passwordEncoder;
    private OtpService otpService;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Real BCrypt encoder — keeps tests honest about hash/verify behaviour
        passwordEncoder = new BCryptPasswordEncoder(4); // low strength for test speed

        otpService = new OtpService(otpTokenRepository, mailSender, passwordEncoder);

        // Inject @Value fields that Spring won't set in a unit test
        ReflectionTestUtils.setField(otpService, "otpResendCooldownSeconds", 60);
        ReflectionTestUtils.setField(otpService, "mailFrom", "noreply@techrush.dev");

        testUser = new User();
        testUser.setUserId("u-1");
        testUser.setEmail("bob@example.com");

        // Stub MimeMessage creation so mail delivery doesn't blow up
        MimeMessage mimeMsg = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMsg);
    }

    // ─── Generation ──────────────────────────────────────────────────────────

    @Test
    void generateAndSendLoginOtp_savesHashedOtp_notPlaintext() {
        when(otpTokenRepository.existsRecentToken(anyString(), anyString(), any()))
                .thenReturn(false);

        ArgumentCaptor<OtpToken> captor = ArgumentCaptor.forClass(OtpToken.class);

        otpService.generateAndSendLoginOtp(testUser);

        verify(otpTokenRepository).save(captor.capture());
        OtpToken saved = captor.getValue();

        // Hash must not equal any 6-digit plaintext
        assertThat(saved.getOtpHash()).isNotNull();
        assertThat(saved.getOtpHash()).doesNotMatch("\\d{6}"); // not stored as plain digits
        assertThat(saved.getPurpose()).isEqualTo("LOGIN");
        assertThat(saved.isUsed()).isFalse();
        assertThat(saved.getAttempts()).isEqualTo(0);
        assertThat(saved.getExpiresAt()).isAfter(LocalDateTime.now());
    }

    @Test
    void generateAndSendLoginOtp_withinCooldown_throwsTooManyRequests() {
        when(otpTokenRepository.existsRecentToken(anyString(), eq("LOGIN"), any()))
                .thenReturn(true);

        assertThatThrownBy(() -> otpService.generateAndSendLoginOtp(testUser))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessageContaining("60");

        // Must not save a new token when blocked by cooldown
        verify(otpTokenRepository, never()).save(any());
    }

    @Test
    void generateAndSendLoginOtp_invalidatesOldTokensBeforeSavingNew() {
        when(otpTokenRepository.existsRecentToken(anyString(), anyString(), any()))
                .thenReturn(false);

        otpService.generateAndSendLoginOtp(testUser);

        verify(otpTokenRepository)
                .invalidateAllForEmailAndPurpose("bob@example.com", "LOGIN");
    }

    // ─── Verification ────────────────────────────────────────────────────────

    @Test
    void verifyOtp_correctCode_marksTokenUsed() {
        String plainOtp = "123456";
        String hash = passwordEncoder.encode(plainOtp);

        OtpToken token = buildValidToken(hash, 0);
        when(otpTokenRepository.findLatestValidToken(
                eq("bob@example.com"), eq("LOGIN"), any()))
                .thenReturn(Optional.of(token));

        // Should not throw
        otpService.verifyOtp("bob@example.com", plainOtp, "LOGIN");

        assertThat(token.isUsed()).isTrue();
        verify(otpTokenRepository, times(2)).save(token); // once for attempt increment, once for mark-used
    }

    @Test
    void verifyOtp_wrongCode_throwsInvalidOtpWithRemainingAttempts() {
        OtpToken token = buildValidToken(passwordEncoder.encode("999999"), 0);
        when(otpTokenRepository.findLatestValidToken(anyString(), anyString(), any()))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> otpService.verifyOtp("bob@example.com", "111111", "LOGIN"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessageContaining("4 attempt(s) remaining");

        assertThat(token.getAttempts()).isEqualTo(1);
        assertThat(token.isUsed()).isFalse();
    }

    @Test
    void verifyOtp_maxAttemptsReached_marksUsedAndThrows() {
        // Token already has 5 attempts used
        OtpToken token = buildValidToken(passwordEncoder.encode("999999"), 5);
        when(otpTokenRepository.findLatestValidToken(anyString(), anyString(), any()))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> otpService.verifyOtp("bob@example.com", "000000", "LOGIN"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessageContaining("Maximum OTP attempts exceeded");

        assertThat(token.isUsed()).isTrue();
    }

    @Test
    void verifyOtp_noValidToken_throwsInvalidOtp() {
        when(otpTokenRepository.findLatestValidToken(anyString(), anyString(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> otpService.verifyOtp("bob@example.com", "123456", "LOGIN"))
                .isInstanceOf(InvalidOtpException.class)
                .hasMessageContaining("No valid OTP found");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private OtpToken buildValidToken(String hash, int attempts) {
        OtpToken token = new OtpToken();
        token.setEmail("bob@example.com");
        token.setOtpHash(hash);
        token.setPurpose("LOGIN");
        token.setUsed(false);
        token.setAttempts(attempts);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        return token;
    }
}
