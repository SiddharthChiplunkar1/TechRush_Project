package com.passwordlessauth.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.entity.OtpToken;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.exception.InvalidOtpException;
import com.passwordlessauth.exception.TooManyRequestsException;
import com.passwordlessauth.repository.OtpTokenRepository;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OTP generation, storage, and email delivery service.
 *
 * Security design:
 * - OTPs are generated using SecureRandom (not Math.random) to ensure cryptographic randomness.
 * - OTPs are hashed with BCrypt before DB storage, preventing plaintext OTP exposure
 *   in case of database breach (same principle as password hashing).
 * - Each OTP is valid for 10 minutes (configurable).
 * - A maximum of 5 verification attempts per OTP is enforced to prevent brute-force.
 * - A 60-second resend cooldown prevents OTP flooding attacks.
 * - Only one active OTP per email+purpose is allowed at any time.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PURPOSE_LOGIN        = "LOGIN";
    private static final String OTP_PURPOSE_VERIFICATION = "EMAIL_VERIFICATION";
    private static final int    OTP_DIGITS               = 6;
    private static final int    OTP_EXPIRY_MINUTES       = 10;
    private static final int    MAX_OTP_ATTEMPTS         = 5;

    @Value("${app.security.otp-resend-cooldown-seconds:60}")
    private int otpResendCooldownSeconds;

    @Value("${spring.mail.from:noreply@techrush.dev}")
    private String mailFrom;

    private final OtpTokenRepository otpTokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    // ─── Generation ──────────────────────────────────────────────────────────

    /**
     * Generates a 6-digit OTP, hashes it, saves to DB, and sends via email.
     *
     * @param user    the user to generate the OTP for
     * @param purpose LOGIN or EMAIL_VERIFICATION
     * @throws TooManyRequestsException if OTP was already sent within the cooldown period
     */
    @Transactional
    public void generateAndSendOtp(User user, String purpose) {
        // Enforce resend cooldown
        LocalDateTime cooldownSince = LocalDateTime.now().minusSeconds(otpResendCooldownSeconds);
        if (otpTokenRepository.existsRecentToken(user.getEmail(), purpose, cooldownSince)) {
            throw new TooManyRequestsException(
                    "OTP already sent. Please wait " + otpResendCooldownSeconds +
                    " seconds before requesting a new one.");
        }

        // Invalidate all previous OTPs for this email+purpose (single-session policy)
        otpTokenRepository.invalidateAllForEmailAndPurpose(user.getEmail(), purpose);

        // Generate cryptographically secure 6-digit OTP
        String otp = generateSecureOtp();

        // Hash OTP before storage
        String otpHash = passwordEncoder.encode(otp);

        // Save OTP token
        OtpToken token = new OtpToken();
        token.setUser(user);
        token.setEmail(user.getEmail());
        token.setOtpHash(otpHash);
        token.setPurpose(purpose);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpTokenRepository.save(token);

        // Send email
        sendOtpEmail(user.getEmail(), otp, purpose);
        log.info("OTP sent to {} for purpose {}", maskEmail(user.getEmail()), purpose);
    }

    /** Convenience overload for login OTPs. */
    @Transactional
    public void generateAndSendLoginOtp(User user) {
        generateAndSendOtp(user, OTP_PURPOSE_LOGIN);
    }

    /** Convenience overload for email verification OTPs. */
    @Transactional
    public void generateAndSendVerificationOtp(User user) {
        generateAndSendOtp(user, OTP_PURPOSE_VERIFICATION);
    }

    // ─── Verification ────────────────────────────────────────────────────────

    /**
     * Verifies an OTP for a given email and purpose.
     *
     * @param email   the user's email
     * @param otpCode the 6-digit OTP the user entered
     * @param purpose LOGIN or EMAIL_VERIFICATION
     * @throws InvalidOtpException if the OTP is wrong, expired, or max attempts exceeded
     */
    @Transactional
    public void verifyOtp(String email, String otpCode, String purpose) {
        OtpToken token = otpTokenRepository
                .findLatestValidToken(email, purpose, LocalDateTime.now())
                .orElseThrow(() -> new InvalidOtpException(
                        "No valid OTP found. Please request a new one."));

        // Brute-force protection: mark as used after max attempts
        if (token.getAttempts() >= MAX_OTP_ATTEMPTS) {
            token.setUsed(true);
            otpTokenRepository.save(token);
            throw new InvalidOtpException(
                    "Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        // Increment attempt counter
        token.setAttempts(token.getAttempts() + 1);
        otpTokenRepository.save(token);

        // Verify against BCrypt hash
        if (!passwordEncoder.matches(otpCode, token.getOtpHash())) {
            int remainingAttempts = MAX_OTP_ATTEMPTS - token.getAttempts();
            throw new InvalidOtpException(
                    "Invalid OTP. " + remainingAttempts + " attempt(s) remaining.");
        }

        // Mark as used — prevents OTP replay attacks
        token.setUsed(true);
        otpTokenRepository.save(token);
        log.info("OTP verified for {} (purpose: {})", maskEmail(email), purpose);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private String generateSecureOtp() {
        SecureRandom random = new SecureRandom();
        int bound = (int) Math.pow(10, OTP_DIGITS);
        int otp = random.nextInt(bound);
        // Zero-pad to ensure always OTP_DIGITS characters
        return String.format("%0" + OTP_DIGITS + "d", otp);
    }

    private void sendOtpEmail(String email, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(email);

            String subject = "LOGIN".equals(purpose)
                    ? "TechRush — Your Login Code"
                    : "TechRush — Verify Your Email";

            helper.setSubject(subject);
            helper.setText(buildEmailBody(otp, purpose), true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send OTP email to {}: {}", maskEmail(email), ex.getMessage());
            // Don't expose mail failures to the caller — the OTP was saved; user can retry
            throw new RuntimeException("Email delivery failed. Please try again.");
        }
    }

    private String buildEmailBody(String otp, String purpose) {
        String action = "LOGIN".equals(purpose) ? "log in" : "verify your email";
        return """
                <html>
                  <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #1a1a2e;">TechRush Banking</h2>
                    <p>Your one-time code to %s is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #4361ee; padding: 20px; background: #f0f4ff;
                                border-radius: 8px; text-align: center;">
                      %s
                    </div>
                    <p style="color: #666;">This code expires in %d minutes.</p>
                    <p style="color: #999; font-size: 12px;">
                      If you didn't request this, please ignore this email.
                    </p>
                  </body>
                </html>
                """.formatted(action, otp, OTP_EXPIRY_MINUTES);
    }

    /** Masks email for logging to prevent PII exposure in log files. */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String user = parts[0];
        String masked = user.length() > 2
                ? user.charAt(0) + "***" + user.charAt(user.length() - 1)
                : "***";
        return masked + "@" + parts[1];
    }
}
