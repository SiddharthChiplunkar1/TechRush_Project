package com.passwordlessauth.service;

import java.time.LocalDateTime;

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
import com.passwordlessauth.dto.requests.TrustedDeviceLoginRequest;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.RefreshToken;
import com.passwordlessauth.entity.User;
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

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final RiskEngineService riskEngineService;
    private final DeviceService deviceService;
    private final LoginHistoryService loginHistoryService;
    private final FaceIdClient faceIdClient;
    private final GoogleOAuthClient googleOAuthClient;
    private final RefreshTokenRepository refreshTokenRepository;

    // ─── Registration ────────────────────────────────────────────────────────

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.USER);
        user.setEmailVerified(false);
        user = userRepository.save(user);

        otpService.generateAndSendVerificationOtp(user);
        log.info("User registered, verification OTP sent: {}", maskEmail(user.getEmail()));

        return RegisterResponse.builder()
                .email(user.getEmail())
                .message("Registration successful. Please verify your email with the OTP sent.")
                .build();
    }

    @Transactional
    public LoginResponse sendOtp(OtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.getEmail());
                    return userRepository.save(newUser);
                });

        checkAccountLock(user);

        RiskLevel risk = riskEngineService.assessRisk(user, null);
        if (risk == RiskLevel.CRITICAL) {
            throw new AccountLockedException("Account access temporarily restricted due to suspicious activity.");
        }

        otpService.generateAndSendLoginOtp(user);
        return LoginResponse.builder().message("OTP sent to your email address.").build();
    }

    @Transactional
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

        return finalizeLogin(user, AuthMethod.OTP, AuthLevel.STRONG, risk, httpRequest, device);
    }

    @Transactional
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


    @Transactional
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
        // Server-to-server code exchange — client never handles the ID token directly
        GoogleUserInfo googleUser = googleOAuthClient.exchangeAuthorizationCode(
                request.getAuthorizationCode(), request.getRedirectUri());

        if (!googleUser.emailVerified()) {
            throw new GoogleAuthException("Google account email is not verified.");
        }

        User user = userRepository.findByGoogleId(googleUser.googleId())
                .or(() -> userRepository.findByEmail(googleUser.email()))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(googleUser.email());
                    newUser.setFirstName(googleUser.firstName());
                    newUser.setLastName(googleUser.lastName());
                    newUser.setGoogleId(googleUser.googleId());
                    newUser.setEmailVerified(true);
                    newUser.setRole(Role.USER);
                    return userRepository.save(newUser);
                });

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
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
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
        rt.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshTokenRepository.save(rt);

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rt.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirySeconds())
                .isNewDevice(isNewDevice)
                .authLevel(authLevel)
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
