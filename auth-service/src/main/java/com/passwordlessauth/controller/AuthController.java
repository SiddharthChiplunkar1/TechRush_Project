package com.passwordlessauth.controller;

import java.time.Duration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.requests.FaceLoginRequest;
import com.passwordlessauth.dto.requests.GoogleLoginRequest;
import com.passwordlessauth.dto.requests.IdentifyRequest;
import com.passwordlessauth.dto.requests.LoginStepUpVerifyRequest;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.requests.RegistrationVerifyRequest;
import com.passwordlessauth.dto.requests.TrustedDeviceLoginRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.IdentifyResponse;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String DEVICE_ID_HEADER = "X-Device-Id";

    private final AuthService authService;

    @Value("${app.security.refresh-cookie-secure}")
    private boolean refreshCookieSecure;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private ResponseEntity<ApiResponse<JwtResponse>> withRefreshCookie(
            JwtResponse jwt
    ) {
        if (jwt == null) {
            throw new IllegalStateException(
                    "Authentication did not return a session"
            );
        }

        String refreshToken = jwt.getRefreshToken();

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(jwt));
        }

        ResponseCookie cookie =
                ResponseCookie
                        .from(
                                REFRESH_COOKIE,
                                refreshToken
                        )
                        .httpOnly(true)
                        .secure(refreshCookieSecure)
                        .sameSite("Lax")
                        .path("/api/auth")
                        .maxAge(
                                Duration.ofMillis(
                                        refreshTokenExpiration
                                )
                        )
                        .build();

        /*
         * JwtResponse must already prevent refreshToken from
         * being serialized into JSON (@JsonIgnore).
         */
        HttpHeaders headers = new HttpHeaders();
        headers.add(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyRegistration(
            @Valid @RequestBody RegistrationVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.verifyRegistration(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/identify")
    public ResponseEntity<ApiResponse<IdentifyResponse>> identify(
            @Valid @RequestBody IdentifyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(authService.identify(request)));
    }

    @PostMapping("/continue")
    public ResponseEntity<ApiResponse<LoginResponse>> continueWithEmail(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(authService.continueWithEmail(request)));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyEmailAuthentication(
            @Valid @RequestBody RegistrationVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.verifyEmailAuthentication(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/login/otp/request")
    public ResponseEntity<ApiResponse<LoginResponse>> requestOtp(
            @Valid @RequestBody OtpRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(authService.sendOtp(request)));
    }

    @PostMapping("/login/otp/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.verifyOtp(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/login/step-up/verify")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyLoginStepUp(
            @Valid @RequestBody LoginStepUpVerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.verifyLoginStepUp(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/login/face")
    public ResponseEntity<ApiResponse<JwtResponse>> faceLogin(
            @Valid @RequestBody FaceLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.faceLogin(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/login/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.googleLogin(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/login/trusted-device")
    public ResponseEntity<ApiResponse<JwtResponse>> trustedDeviceLogin(
            @Valid @RequestBody TrustedDeviceLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return withRefreshCookie(
                authService.trustedDeviceLogin(
                        request,
                        httpRequest
                )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            HttpServletRequest request
    ) {
        String refreshToken =
                extractRefreshCookie(request);

        return withRefreshCookie(
                authService.refreshToken(
                        refreshToken
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "false")
            boolean allDevices,
            HttpServletRequest request
    ) {
        if (principal == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            ApiResponse.error(
                                    "Authentication required"
                            )
                    );
        }

        String deviceId =
                request.getHeader(
                        DEVICE_ID_HEADER
                );

        authService.logout(
                principal.getUserId(),
                deviceId,
                allDevices
        );

        return clearRefreshCookie();
    }

    private String extractRefreshCookie(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_COOKIE.equals(cookie.getName())) {

                    String value = cookie.getValue();

                    if (value != null
                            && !value.isBlank()) {
                        return value;
                    }
                }
            }
        }

        throw new com.passwordlessauth.exception.InvalidTokenException(
                "Refresh session unavailable"
        );
    }

    private ResponseEntity<ApiResponse<Void>> clearRefreshCookie() {

        ResponseCookie cookie =
                ResponseCookie
                        .from(REFRESH_COOKIE, "")
                        .httpOnly(true)
                        .secure(refreshCookieSecure)
                        .sameSite("Lax")
                        .path("/api/auth")
                        .maxAge(Duration.ZERO)
                        .build();

        HttpHeaders headers = new HttpHeaders();

        headers.add(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success("Logged out successfully"));
    }
}
