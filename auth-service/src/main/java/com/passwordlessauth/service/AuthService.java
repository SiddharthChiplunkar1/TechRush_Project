package com.passwordlessauth.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.client.FaceIdClient;
import com.passwordlessauth.client.FaceVerifyResult;
import com.passwordlessauth.client.GoogleOAuthClient;
import com.passwordlessauth.client.GoogleUserInfo;
import com.passwordlessauth.dto.requests.FaceLoginRequest;
import com.passwordlessauth.dto.requests.GoogleLoginRequest;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.requests.RefreshTokenRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.requests.RegistrationVerifyRequest;
import com.passwordlessauth.dto.requests.IdentifyRequest;
import com.passwordlessauth.dto.requests.LoginStepUpVerifyRequest;
import com.passwordlessauth.dto.requests.TrustedDeviceLoginRequest;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.dto.responses.IdentifyResponse;
import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.RefreshToken;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.entity.PendingRegistration;
import com.passwordlessauth.entity.PendingAuthentication;
import com.passwordlessauth.enums.AuthLevel;
import com.passwordlessauth.enums.AuthMethod;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.enums.Role;
import com.passwordlessauth.exception.AccountLockedException;
import com.passwordlessauth.exception.FaceVerificationException;
import com.passwordlessauth.exception.GoogleAuthException;
import com.passwordlessauth.exception.InvalidTokenException;
import com.passwordlessauth.exception.TrustedDeviceNotFoundException;
import com.passwordlessauth.exception.UserAlreadyExistsException;
import com.passwordlessauth.exception.UserNotFoundException;
import com.passwordlessauth.repository.RefreshTokenRepository;
import com.passwordlessauth.repository.UserRepository;
import com.passwordlessauth.repository.PendingRegistrationRepository;
import com.passwordlessauth.repository.PendingAuthenticationRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.security.max-failed-login-attempts:10}")
    private int maxFailedAttempts;

    @Value("${app.security.account-lock-duration-minutes:30}")
    private int lockDurationMinutes;

    @Value("${app.jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final RiskEngineService riskEngineService;
    private final DeviceService deviceService;
    private final LoginHistoryService loginHistoryService;
    private final FaceIdClient faceIdClient;
    private final GoogleOAuthClient googleOAuthClient;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PendingAuthenticationRepository pendingAuthenticationRepository;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        PendingRegistration pending = new PendingRegistration();
        pending.setEmail(request.getEmail().trim().toLowerCase());
        pending.setFirstName(request.getFirstName());
        pending.setLastName(request.getLastName());
        pendingRegistrationRepository.save(pending);
        otpService.generateAndSendRegistrationOtp(pending.getEmail());
        log.info("Registration OTP sent: {}", maskEmail(pending.getEmail()));

        return RegisterResponse.builder()
                .email(pending.getEmail())
                .message("Please verify your email with the OTP sent.")
                .build();
    }

    @Transactional
    public JwtResponse verifyRegistration(RegistrationVerifyRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().trim().toLowerCase();
        PendingRegistration pending = pendingRegistrationRepository.findById(email)
                .orElseThrow(() -> new UserNotFoundException("Registration request not found. Please start again."));
        otpService.verifyOtp(email, request.getOtp(), "EMAIL_VERIFICATION");
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }
        User user = new User();
        user.setEmail(email);
        user.setFirstName(pending.getFirstName());
        user.setLastName(pending.getLastName());
        user.setRole(Role.USER);
        user.setEmailVerified(true);
        user = userRepository.save(user);
        pendingRegistrationRepository.delete(pending);
        Device device = deviceService.resolveDevice(user, httpRequest);
        return finalizeLogin(user, AuthMethod.OTP, AuthLevel.STRONG,
                riskEngineService.assessRisk(user, httpRequest), httpRequest, device);
    }

    public IdentifyResponse identify(IdentifyRequest request) {
        return IdentifyResponse.builder()
                // Do not reveal account state before an authentication challenge.
                .nextStep("CONTINUE")
                .build();
    }

    @Transactional
    public LoginResponse continueWithEmail(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            OtpRequest login = new OtpRequest();
            login.setEmail(email);
            return sendOtp(login);
        }
        register(request);
        return LoginResponse.builder().message("If the email can be used, a verification code has been sent.").build();
    }

    @Transactional(noRollbackFor = {com.passwordlessauth.exception.InvalidOtpException.class})
    public JwtResponse verifyEmailAuthentication(RegistrationVerifyRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            OtpVerifyRequest login = new OtpVerifyRequest();
            login.setLoginId(email); login.setOtp(request.getOtp());
            return verifyOtp(login, httpRequest);
        }
        return verifyRegistration(request, httpRequest);
    }

    @Transactional
    public LoginResponse sendOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return LoginResponse.builder()
                    .message("If the email is registered, an OTP has been sent.")
                    .build();
        }

        checkAccountLock(user);

        RiskLevel risk = riskEngineService.assessRisk(user, null);
        if (risk == RiskLevel.CRITICAL) {
            throw new AccountLockedException("Account access temporarily restricted due to suspicious activity.");
        }

        otpService.generateAndSendLoginOtp(user);
        return LoginResponse.builder()
                .message("If the email is registered, an OTP has been sent.")
                .build();
    }

    @Transactional(noRollbackFor = {com.passwordlessauth.exception.InvalidOtpException.class, com.passwordlessauth.exception.FaceVerificationException.class, com.passwordlessauth.exception.TrustedDeviceNotFoundException.class})
    public JwtResponse verifyOtp(OtpVerifyRequest request, HttpServletRequest httpRequest) {
        String email = request.getLoginId();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        checkAccountLock(user);

        RiskLevel risk   = riskEngineService.assessRisk(user, httpRequest);
        Device    device = deviceService.resolveDevice(user, httpRequest);

        try {
            otpService.verifyOtp(email, request.getOtp(), "LOGIN");
        } catch (Exception ex) {
            handleFailedLogin(user, AuthMethod.OTP, risk, httpRequest, device, ex.getMessage());
            throw ex;
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
        }

        if (riskEngineService.requiresStepUp(risk)) {
            return beginLoginStepUp(user, device);
        }
        return finalizeLogin(user, AuthMethod.OTP, AuthLevel.STRONG, risk, httpRequest, device);
    }

    @Transactional(noRollbackFor = com.passwordlessauth.exception.InvalidOtpException.class)
    public JwtResponse verifyLoginStepUp(LoginStepUpVerifyRequest request, HttpServletRequest httpRequest) {
        PendingAuthentication pending = pendingAuthenticationRepository.findActive(
                request.getChallengeId(), LocalDateTime.now())
                .orElseThrow(() -> new com.passwordlessauth.exception.InvalidOtpException("Authentication challenge is invalid or expired."));
        User user = pending.getUser();
        try {
            otpService.verifyOtp(user.getEmail(), request.getOtp(), "LOGIN_STEP_UP");
        } catch (Exception ex) {
            throw ex;
        }
        if (pendingAuthenticationRepository.consume(pending.getChallengeId(), LocalDateTime.now()) != 1) {
            throw new com.passwordlessauth.exception.InvalidOtpException("Authentication challenge has already been used.");
        }
        Device device = deviceService.resolveDevice(user, httpRequest);
        if (!device.getDeviceId().equals(pending.getDeviceId())) {
            throw new com.passwordlessauth.exception.InvalidOtpException("Authentication challenge cannot be used from this device.");
        }
        return finalizeLogin(user, AuthMethod.OTP, AuthLevel.STRONG,
                riskEngineService.assessRisk(user, httpRequest), httpRequest, device);
    }

    @Transactional(noRollbackFor = {com.passwordlessauth.exception.InvalidOtpException.class, com.passwordlessauth.exception.FaceVerificationException.class, com.passwordlessauth.exception.TrustedDeviceNotFoundException.class})
    public JwtResponse trustedDeviceLogin(TrustedDeviceLoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        checkAccountLock(user);

        RiskLevel risk = riskEngineService.assessRisk(user, httpRequest);
        if (risk == RiskLevel.CRITICAL) {
            log.warn("Trusted-device login blocked (CRITICAL risk) for user {}", maskId(user.getUserId()));
            throw new AccountLockedException("Login temporarily blocked due to high-risk activity.");
        }

        boolean trusted = deviceService.isTrustedDevice(user, httpRequest);
        if (!trusted) {
            handleFailedLogin(user, AuthMethod.TRUSTED_DEVICE, risk, httpRequest, null,
                    "Device not trusted");
            throw new TrustedDeviceNotFoundException(
                    "This device is not registered as trusted. Please log in with OTP or Face ID.");
        }

        Device device = deviceService.resolveDevice(user, httpRequest);

        return finalizeLogin(user, AuthMethod.TRUSTED_DEVICE, AuthLevel.WEAK, risk, httpRequest, device);
    }

    @Transactional(noRollbackFor = {com.passwordlessauth.exception.InvalidOtpException.class, com.passwordlessauth.exception.FaceVerificationException.class, com.passwordlessauth.exception.TrustedDeviceNotFoundException.class})
    public JwtResponse faceLogin(FaceLoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        checkAccountLock(user);

        if (!user.isFaceEnrolled()) {
            throw new FaceVerificationException("Face ID is not enrolled for this account.");
        }

        RiskLevel risk   = riskEngineService.assessRisk(user, httpRequest);
        Device    device = deviceService.resolveDevice(user, httpRequest);

        try {
            FaceVerifyResult result = faceIdClient.verifyFace(user.getUserId(), request.getFaceImage());
            if (!result.isMatched() || !result.isLive()) {
                throw new FaceVerificationException(
                        "Face verification failed. Confidence: " + result.getConfidence());
            }
        } catch (Exception ex) {
            handleFailedLogin(user, AuthMethod.FACE_RECOGNITION, risk, httpRequest, device, ex.getMessage());
            throw ex;
        }

        return finalizeLogin(user, AuthMethod.FACE_RECOGNITION, AuthLevel.STRONG, risk, httpRequest, device);
    }

    @Transactional
    public JwtResponse googleLogin(GoogleLoginRequest request, HttpServletRequest httpRequest) {
        GoogleUserInfo googleUser = googleOAuthClient.exchangeAuthorizationCode(
                request.getAuthorizationCode(), request.getRedirectUri());

        if (!googleUser.emailVerified()) {
            throw new GoogleAuthException("Google account email is not verified.");
        }

        User user = userRepository.findByGoogleId(googleUser.googleId())
                .or(() -> userRepository.findByEmail(googleUser.email()))
                .orElseThrow(() -> new UserNotFoundException(
                        "Account not found. Please register before using Google login."));

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleUser.googleId());
        }
        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
        }

        checkAccountLock(user);

        RiskLevel risk   = riskEngineService.assessRisk(user, httpRequest);
        Device    device = deviceService.resolveDevice(user, httpRequest);

        return finalizeLogin(user, AuthMethod.GOOGLE_OAUTH, AuthLevel.STRONG, risk, httpRequest, device);
    }

    @Transactional
    public JwtResponse refreshToken(String rawToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Refresh token is expired or revoked. Please log in again.");
        }

        User user = refreshToken.getUser();

        refreshToken.setRevoked(true);
        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshToken.setRevokedReason("ROTATED");
        refreshTokenRepository.save(refreshToken);

        return generateTokensResponse(user, AuthLevel.STRONG, refreshToken.getDeviceId(), false);
    }

    @Transactional
    public void logout(String currentUserId, String deviceId, boolean allDevices) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (allDevices) {
            user.setTokenVersion(user.getTokenVersion() + 1);
            userRepository.save(user);
            refreshTokenRepository.revokeAllUserTokens(user.getUserId(), "LOGOUT_ALL", LocalDateTime.now());
            log.info("User {} logged out from all devices (tokenVersion incremented)", maskId(user.getUserId()));
        } else {
            if (deviceId != null) {
                refreshTokenRepository.revokeAllDeviceTokens(deviceId);
            }
            log.info("User {} logged out from current device", maskId(user.getUserId()));
        }

        loginHistoryService.recordLogin(
                user, AuthMethod.OTP, LoginStatus.SUCCESS, RiskLevel.LOW, null, deviceId, "LOGOUT");
    }

    private JwtResponse finalizeLogin(User user, AuthMethod method, AuthLevel authLevel,
                                      RiskLevel risk, HttpServletRequest request, Device device) {
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        loginHistoryService.recordLogin(user, method, LoginStatus.SUCCESS, risk,
                request, device.getDeviceId(), null);

        boolean isNewDevice = !device.isTrusted();
        return generateTokensResponse(user, authLevel, device.getDeviceId(), isNewDevice);
    }

    private void handleFailedLogin(User user, AuthMethod method, RiskLevel risk,
                                   HttpServletRequest request, Device device, String reason) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= maxFailedAttempts) {
            user.setAccountNonLocked(false);
            user.setLockedUntil(LocalDateTime.now().plusMinutes(lockDurationMinutes));
            log.warn("Account locked after {} failed attempts for user {}", attempts, maskId(user.getUserId()));
        }

        userRepository.save(user);

        LoginStatus status = (attempts >= maxFailedAttempts) ? LoginStatus.BLOCKED : LoginStatus.FAILED;
        loginHistoryService.recordLogin(user, method, status, risk, request,
                device != null ? device.getDeviceId() : null, reason);
    }

    private void checkAccountLock(User user) {
        if (!user.isAccountNonLocked()) {
            if (user.getLockedUntil() != null && LocalDateTime.now().isAfter(user.getLockedUntil())) {
                user.setAccountNonLocked(true);
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
                userRepository.save(user);
            } else {
                throw new AccountLockedException("Account is temporarily locked. Please try again later.");
            }
        }
    }

    private JwtResponse generateTokensResponse(User user, AuthLevel authLevel,
                                                String deviceId, boolean isNewDevice) {
        String accessToken = jwtService.generateAccessToken(user, authLevel);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(jwtService.generateRefreshToken());
        rt.setDeviceId(deviceId);
        rt.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
        refreshTokenRepository.save(rt);

        return JwtResponse.builder()
                .accessToken(accessToken)
                // JsonIgnore keeps this credential out of the response body; the controller
                // uses it solely to set the HttpOnly refresh cookie.
                .refreshToken(rt.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirySeconds())
                .isNewDevice(isNewDevice)
                .authLevel(authLevel)
                .authenticationState("AUTHENTICATED")
                .user(UserResponse.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .emailVerified(user.isEmailVerified())
                        .faceEnrolled(user.isFaceEnrolled())
                        .createdAt(user.getCreatedAt())
                        .lastLoginAt(user.getLastLoginAt())
                        .build())
                .build();
    }

    private JwtResponse beginLoginStepUp(User user, Device device) {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        PendingAuthentication pending = new PendingAuthentication();
        pending.setChallengeId(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
        pending.setUser(user);
        pending.setDeviceId(device.getDeviceId());
        pending.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        pendingAuthenticationRepository.save(pending);
        otpService.generateAndSendLoginStepUpOtp(user);
        return JwtResponse.builder()
                .authenticationState("STEP_UP_REQUIRED")
                .authenticationChallenge(pending.getChallengeId())
                .requiredAuthenticationMethod("OTP")
                .expiresIn(300)
                .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String local = parts[0];
        String masked = local.length() > 2
                ? local.charAt(0) + "***" + local.charAt(local.length() - 1)
                : "***";
        return masked + "@" + parts[1];
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }
}
