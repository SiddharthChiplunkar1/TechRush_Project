package com.passwordlessauth.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

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
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.dto.responses.IdentifyResponse;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
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

    @Value("${app.security.refresh-cookie-secure:false}")
    private boolean refreshCookieSecure;

    private ResponseEntity<ApiResponse<JwtResponse>> withRefreshCookie(JwtResponse jwt) {
        if (jwt.getRefreshToken() == null) {
            return ResponseEntity.ok(ApiResponse.success(jwt));
        }
        ResponseCookie cookie = ResponseCookie.from("refresh_token", jwt.getRefreshToken())
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(7L * 24 * 3600)
                .sameSite("Lax")
                .secure(refreshCookieSecure)
                .build();
        // Never expose the refresh credential in JSON; it is cookie-only.

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().headers(headers).body(ApiResponse.success(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyRegistration(
            @Valid @RequestBody RegistrationVerifyRequest request, HttpServletRequest httpRequest) {
        return withRefreshCookie(authService.verifyRegistration(request, httpRequest));
    }

    @PostMapping("/identify")
    public ResponseEntity<ApiResponse<IdentifyResponse>> identify(@Valid @RequestBody IdentifyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.identify(request)));
    }

    @PostMapping("/continue")
    public ResponseEntity<ApiResponse<LoginResponse>> continueWithEmail(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.continueWithEmail(request)));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyEmailAuthentication(
            @Valid @RequestBody RegistrationVerifyRequest request, HttpServletRequest httpRequest) {
        return withRefreshCookie(authService.verifyEmailAuthentication(request, httpRequest));
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

    @PostMapping("/login/step-up/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyLoginStepUp(
            @Valid @RequestBody LoginStepUpVerifyRequest request, HttpServletRequest httpRequest) {
        return withRefreshCookie(authService.verifyLoginStepUp(request, httpRequest));
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
            HttpServletRequest httpRequest) {
        String refresh = null;
        if (httpRequest.getCookies() != null) {
            for (Cookie cookie : httpRequest.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) refresh = cookie.getValue();
            }
        }
        if (refresh == null || refresh.isBlank()) {
            throw new com.passwordlessauth.exception.InvalidTokenException("Refresh session unavailable");
        }
        RefreshTokenRequest request = new RefreshTokenRequest();
        JwtResponse jwt = authService.refreshToken(refresh);
        if (jwt == null) {
            throw new IllegalStateException("Refresh token rotation returned no token");
        }
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
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Lax")
                .secure(refreshCookieSecure)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok().headers(headers).body(ApiResponse.success("Logged out successfully"));
    }
}
