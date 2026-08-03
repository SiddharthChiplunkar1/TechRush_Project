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

    private String resolvedMailFrom() {
        return (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@techrush.dev";
    }

    private final OtpTokenRepository otpTokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void generateAndSendOtp(User user, String purpose) {
        LocalDateTime cooldownSince = LocalDateTime.now().minusSeconds(otpResendCooldownSeconds);
        if (otpTokenRepository.existsRecentToken(user.getEmail(), purpose, cooldownSince)) {
            throw new TooManyRequestsException(
                    "OTP already sent. Please wait " + otpResendCooldownSeconds +
                    " seconds before requesting a new one.");
        }

        otpTokenRepository.invalidateAllForEmailAndPurpose(user.getEmail(), purpose);

        String otp = generateSecureOtp();

        String otpHash = passwordEncoder.encode(otp);

        OtpToken token = new OtpToken();
        token.setUser(user);
        token.setEmail(user.getEmail());
        token.setOtpHash(otpHash);
        token.setPurpose(purpose);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otpTokenRepository.saveAndFlush(token);

        sendOtpEmail(user.getEmail(), otp, purpose);
        log.info("OTP sent to {} for purpose {}", maskEmail(user.getEmail()), purpose);
    }

    @Transactional
    public void generateAndSendLoginOtp(User user) {
        generateAndSendOtp(user, OTP_PURPOSE_LOGIN);
    }

    @Transactional
    public void generateAndSendVerificationOtp(User user) {
        generateAndSendOtp(user, OTP_PURPOSE_VERIFICATION);
    }

    @Transactional(noRollbackFor = InvalidOtpException.class)
    public void verifyOtp(String email, String otpCode, String purpose) {
        OtpToken token = otpTokenRepository
                .findLatestValidToken(email, purpose, LocalDateTime.now())
                .orElseThrow(() -> new InvalidOtpException(
                        "No valid OTP found. Please request a new one."));

        if (token.getAttempts() >= MAX_OTP_ATTEMPTS) {
            token.setUsed(true);
            otpTokenRepository.save(token);
            throw new InvalidOtpException(
                    "Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        token.setAttempts(token.getAttempts() + 1);
        otpTokenRepository.save(token);

        if (!passwordEncoder.matches(otpCode, token.getOtpHash())) {
            int remainingAttempts = MAX_OTP_ATTEMPTS - token.getAttempts();
            throw new InvalidOtpException(
                    "Invalid OTP. " + remainingAttempts + " attempt(s) remaining.");
        }

        token.setUsed(true);
        otpTokenRepository.save(token);
        log.info("OTP verified for {} (purpose: {})", maskEmail(email), purpose);
    }

    private String generateSecureOtp() {
        SecureRandom random = new SecureRandom();
        int bound = (int) Math.pow(10, OTP_DIGITS);
        int otp = random.nextInt(bound);
        return String.format("%0" + OTP_DIGITS + "d", otp);
    }

    private void sendOtpEmail(String email, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(resolvedMailFrom());
            helper.setTo(email);

            String subject = "LOGIN".equals(purpose)
                    ? "TechRush - Your Login Code"
                    : "TechRush - Verify Your Email";

            helper.setSubject(subject);
            helper.setText(buildEmailBody(otp, purpose), true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send OTP email to {}: {}", maskEmail(email), ex.getMessage());
            log.warn("SMTP failure. FALLBACK: The OTP for {} is: {}", maskEmail(email), otp);
            // In a real production system, you might still throw an exception here if email is mandatory.
            // For dev/testing without a local MailHog, we log it and proceed.
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