package com.passwordlessauth;

import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.RefreshToken;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.AuthLevel;
import com.passwordlessauth.enums.AuthMethod;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.enums.Role;
import com.passwordlessauth.exception.InvalidOtpException;
import com.passwordlessauth.repository.DeviceRepository;
import com.passwordlessauth.repository.LoginHistoryRepository;
import com.passwordlessauth.repository.RefreshTokenRepository;
import com.passwordlessauth.repository.UserRepository;
import com.passwordlessauth.repository.PendingRegistrationRepository;
import com.passwordlessauth.repository.PendingAuthenticationRepository;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.requests.LoginStepUpVerifyRequest;
import com.passwordlessauth.entity.PendingRegistration;
import com.passwordlessauth.entity.PendingAuthentication;
import com.passwordlessauth.service.AuthService;
import com.passwordlessauth.service.DeviceService;
import com.passwordlessauth.service.JwtService;
import com.passwordlessauth.service.LoginHistoryService;
import com.passwordlessauth.service.OtpService;
import com.passwordlessauth.service.RiskEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthLoginOtpRegressionTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private JwtService jwtService;

    @Mock
    private RiskEngineService riskEngineService;

    @Mock
    private DeviceService deviceService;

    @Mock
    private LoginHistoryService loginHistoryService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Mock
    private PendingAuthenticationRepository pendingAuthenticationRepository;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 10);
        ReflectionTestUtils.setField(authService, "lockDurationMinutes", 30);
    }

    @Test
    void sendOtp_unregisteredEmail_doesNotCreateUserOrIssueSession() {
        OtpRequest request = new OtpRequest();
        request.setEmail("security-regression-12345@example.test");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        LoginResponse response = authService.sendOtp(request);

        assertThat(response.getMessage())
                .isEqualTo("If the email is registered, an OTP has been sent.");
        verify(userRepository, never()).save(any());
        verify(otpService, never()).generateAndSendLoginOtp(any());
        verify(jwtService, never()).generateAccessToken(any(), any());
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void verifyOtp_unregisteredEmail_doesNotAuthenticate() {
        OtpVerifyRequest request = new OtpVerifyRequest();
        request.setLoginId("security-regression-67890@example.test");
        request.setOtp("123456");

        when(userRepository.findByEmail(request.getLoginId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyOtp(request, httpRequest))
                .isInstanceOf(RuntimeException.class);

        verify(otpService, never()).verifyOtp(anyString(), anyString(), anyString());
        verify(jwtService, never()).generateAccessToken(any(), any());
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void sendOtp_registeredEmail_stillWorks() {
        User user = new User();
        user.setUserId("user-1");
        user.setEmail("registered@example.test");
        user.setRole(Role.USER);
        user.setEmailVerified(true);
        user.setAccountNonLocked(true);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(riskEngineService.assessRisk(user, null)).thenReturn(RiskLevel.LOW);

        OtpRequest request = new OtpRequest();
        request.setEmail(user.getEmail());
        LoginResponse response = authService.sendOtp(request);

        assertThat(response.getMessage())
                .isEqualTo("If the email is registered, an OTP has been sent.");
        verify(otpService).generateAndSendLoginOtp(user);
    }

    @Test
    void verifyOtp_registeredEmail_canStillIssueJwt() {
        User user = new User();
        user.setUserId("user-2");
        user.setEmail("registered2@example.test");
        user.setRole(Role.USER);
        user.setEmailVerified(false);
        user.setAccountNonLocked(true);

        Device device = new Device();
        device.setDeviceId("device-1");
        device.setUser(user);
        device.setTrusted(true);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(riskEngineService.assessRisk(user, httpRequest)).thenReturn(RiskLevel.LOW);
        when(deviceService.resolveDevice(user, httpRequest)).thenReturn(device);
        when(jwtService.generateAccessToken(user, AuthLevel.STRONG)).thenReturn("real-access-token");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);

        OtpVerifyRequest request = new OtpVerifyRequest();
        request.setLoginId(user.getEmail());
        request.setOtp("123456");
        JwtResponse response = authService.verifyOtp(request, httpRequest);

        assertThat(response.getAccessToken()).isEqualTo("real-access-token");
        assertThat(response.getAuthLevel()).isEqualTo(AuthLevel.STRONG);
        verify(otpService).verifyOtp(user.getEmail(), "123456", "LOGIN");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void registrationRequest_createsOnlyPendingRegistration_notAUserOrSession() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new-user@example.test");
        request.setFirstName("New");
        request.setLastName("User");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);

        authService.register(request);

        verify(pendingRegistrationRepository).save(any(PendingRegistration.class));
        verify(otpService).generateAndSendRegistrationOtp(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtService, never()).generateAccessToken(any(), any());
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }

    @Test
    void loginOtp_stepUpRequired_withholdsSessionUntilChallengeIsConsumed() {
        User user = new User();
        user.setUserId("step-up-user"); user.setEmail("stepup@example.test");
        user.setRole(Role.USER); user.setAccountNonLocked(true);
        Device device = new Device(); device.setDeviceId("device-step-up"); device.setUser(user);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(riskEngineService.assessRisk(user, httpRequest)).thenReturn(RiskLevel.MEDIUM);
        when(riskEngineService.requiresStepUp(RiskLevel.MEDIUM)).thenReturn(true);
        when(deviceService.resolveDevice(user, httpRequest)).thenReturn(device);

        OtpVerifyRequest login = new OtpVerifyRequest();
        login.setLoginId(user.getEmail()); login.setOtp("123456");
        JwtResponse pending = authService.verifyOtp(login, httpRequest);

        assertThat(pending.getAuthenticationState()).isEqualTo("STEP_UP_REQUIRED");
        assertThat(pending.getAccessToken()).isNull();
        assertThat(pending.getRefreshToken()).isNull();
        verify(otpService).verifyOtp(user.getEmail(), "123456", "LOGIN");
        verify(otpService).generateAndSendLoginStepUpOtp(user);
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));

        PendingAuthentication challenge = new PendingAuthentication();
        challenge.setChallengeId(pending.getAuthenticationChallenge());
        challenge.setUser(user); challenge.setDeviceId(device.getDeviceId());
        challenge.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(1));
        when(pendingAuthenticationRepository.findActive(anyString(), any())).thenReturn(Optional.of(challenge));
        when(pendingAuthenticationRepository.consume(anyString(), any())).thenReturn(1);
        when(jwtService.generateAccessToken(user, AuthLevel.STRONG)).thenReturn("access-after-step-up");
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);

        LoginStepUpVerifyRequest complete = new LoginStepUpVerifyRequest();
        complete.setChallengeId(pending.getAuthenticationChallenge()); complete.setOtp("654321");
        JwtResponse session = authService.verifyLoginStepUp(complete, httpRequest);

        assertThat(session.getAccessToken()).isEqualTo("access-after-step-up");
        verify(otpService).verifyOtp(user.getEmail(), "654321", "LOGIN_STEP_UP");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }
}
