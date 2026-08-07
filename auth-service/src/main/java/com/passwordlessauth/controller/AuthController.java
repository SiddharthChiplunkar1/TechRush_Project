package com.passwordlessauth.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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

    private ResponseEntity<ApiResponse<JwtResponse>> withRefreshCookie(JwtResponse jwt) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", jwt.getRefreshToken())
                .httpOnly(true)
                .path("/")
                .maxAge(jwt.getExpiresIn() == null ? 7 * 24 * 3600 : 7 * 24 * 3600)
                .sameSite("Lax")
                .secure(false) // for dev; set to true in prod with HTTPS
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().headers(headers).body(ApiResponse.success(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login/otp/request")
    public ResponseEntity<ApiResponse<LoginResponse>> requestOtp(
            @Valid @RequestBody OtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.sendOtp(request)));
    }

    @PostMapping("/login/otp/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletRequest httpRequest) {
        JwtResponse jwt = authService.verifyOtp(request, httpRequest);
        return withRefreshCookie(jwt);
    }

    @PostMapping("/login/face")
    public ResponseEntity<ApiResponse<JwtResponse>> faceLogin(
            @Valid @RequestBody FaceLoginRequest request,
            HttpServletRequest httpRequest) {
        JwtResponse jwt = authService.faceLogin(request, httpRequest);
        return withRefreshCookie(jwt);
    }

    @PostMapping("/login/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest) {
        JwtResponse jwt = authService.googleLogin(request, httpRequest);
        return withRefreshCookie(jwt);
    }

    @PostMapping("/login/trusted-device")
    public ResponseEntity<ApiResponse<JwtResponse>> trustedDeviceLogin(
            @Valid @RequestBody TrustedDeviceLoginRequest request,
            HttpServletRequest httpRequest) {
        JwtResponse jwt = authService.trustedDeviceLogin(request, httpRequest);
        return withRefreshCookie(jwt);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        JwtResponse jwt = authService.refreshToken(request);
        return withRefreshCookie(jwt);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "false") boolean allDevices,
            HttpServletRequest httpRequest) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }
        String deviceId = httpRequest.getHeader("X-Device-Id");
        authService.logout(principal.getUserId(), deviceId, allDevices);

        // clear refresh cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .secure(false)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().headers(headers).body(ApiResponse.success("Logged out successfully"));
    }
}
