package com.passwordlessauth.controller;

import com.passwordlessauth.dto.requests.FaceLoginRequest;
import com.passwordlessauth.dto.requests.GoogleLoginRequest;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.requests.RefreshTokenRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> registerUser(
            @Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(ApiResponse.success("Registration request received", authService.register(registerRequest)));
    }

    @PostMapping("/login/otp")
    public ResponseEntity<ApiResponse<LoginResponse>> sendOtp(
            @Valid @RequestBody OtpRequest otpRequest,
            HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(ApiResponse.success("OTP request received", authService.sendOtp(otpRequest)));
    }

    @PostMapping("/login/otp/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest otpVerifyRequest,
            HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(ApiResponse.success("OTP verified", authService.verifyOtp(otpVerifyRequest, httpServletRequest)));
    }

    @PostMapping("/login/face")
    public ResponseEntity<ApiResponse<JwtResponse>> faceLogin(
            @Valid @RequestBody FaceLoginRequest faceLoginRequest) {
        return ResponseEntity.ok(ApiResponse.success("Face login request received", authService.faceLogin(faceLoginRequest)));
    }

    @PostMapping("/login/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest googleLoginRequest) {
        return ResponseEntity.ok(ApiResponse.success("Google login request received", authService.googleLogin(googleLoginRequest)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(ApiResponse.success("Refresh token request received", authService.refreshToken(refreshTokenRequest)));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestParam(required = false, defaultValue = "false") boolean allDevices) {
        authService.logout("current-user", allDevices);
        return ResponseEntity.ok(ApiResponse.success("Logout completed", null));
    }
}
