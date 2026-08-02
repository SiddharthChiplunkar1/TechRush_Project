package com.passwordlessauth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.requests.FaceLoginRequest;
import com.passwordlessauth.dto.requests.GoogleLoginRequest;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.requests.RefreshTokenRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.requests.TrustedDeviceLoginRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Authentication controller — handles every public auth flow plus
 * token refresh and logout.  No business logic lives here; it only
 * validates input, delegates to {@link AuthService}, and shapes the
 * HTTP response.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ─── Registration ────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    // ─── OTP Login ───────────────────────────────────────────────────────────

    @PostMapping("/login/otp/request")
    public ResponseEntity<ApiResponse<LoginResponse>> requestOtp(
            @Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.sendOtp(request)));
    }

    @PostMapping("/login/otp/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.verifyOtp(request, httpRequest)));
    }

    // ─── Face Login ──────────────────────────────────────────────────────────

    @PostMapping("/login/face")
    public ResponseEntity<ApiResponse<JwtResponse>> faceLogin(
            @Valid @RequestBody FaceLoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.faceLogin(request, httpRequest)));
    }

    // ─── Google OAuth Login ──────────────────────────────────────────────────

    @PostMapping("/login/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.googleLogin(request, httpRequest)));
    }

    // ─── Trusted Device Login (WEAK auth level) ──────────────────────────────

    /**
     * Login from a device the user has previously trusted.
     *
     * The frontend must send the {@code X-Device-Fingerprint} header so the server
     * can verify the device against the trusted-devices table.
     * The resulting JWT will have {@code authLevel = WEAK} — banking operations
     * that require STRONG auth will reject it with 403.
     */
    @PostMapping("/login/trusted-device")
    public ResponseEntity<ApiResponse<JwtResponse>> trustedDeviceLogin(
            @Valid @RequestBody TrustedDeviceLoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(
                authService.trustedDeviceLogin(request, httpRequest)));
    }

    // ─── Token Refresh ───────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request)));
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "false") boolean allDevices,
            HttpServletRequest httpRequest) {
        // Pass the device fingerprint so single-device logout can revoke only that device's token
        String deviceId = httpRequest.getHeader("X-Device-Id");
        authService.logout(principal.getUserId(), deviceId, allDevices);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
