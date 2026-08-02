package com.passwordlessauth.service;

import org.springframework.stereotype.Service;

import com.passwordlessauth.dto.requests.FaceLoginRequest;
import com.passwordlessauth.dto.requests.GoogleLoginRequest;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.OtpVerifyRequest;
import com.passwordlessauth.dto.requests.RefreshTokenRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class AuthService {
    public RegisterResponse register(RegisterRequest request) {
        return RegisterResponse.builder()
                .email(request.getEmail())
                .message("Registration request received")
                .build();
    }

    public LoginResponse sendOtp(OtpRequest request) {
        return LoginResponse.builder()
                .message("OTP request received")
                .build();
    }

    public JwtResponse verifyOtp(OtpVerifyRequest request, HttpServletRequest httpServletRequest) {
        return JwtResponse.builder()
                .accessToken("stub-access-token")
                .refreshToken("stub-refresh-token")
                .expiresIn(900)
                .build();
    }

    public JwtResponse faceLogin(FaceLoginRequest request) {
        return JwtResponse.builder()
                .accessToken("stub-access-token")
                .refreshToken("stub-refresh-token")
                .expiresIn(900)
                .build();
    }

    public JwtResponse googleLogin(GoogleLoginRequest request) {
        return JwtResponse.builder()
                .accessToken("stub-access-token")
                .refreshToken("stub-refresh-token")
                .expiresIn(900)
                .build();
    }

    public JwtResponse refreshToken(RefreshTokenRequest request) {
        return JwtResponse.builder()
                .accessToken("stub-access-token")
                .refreshToken("stub-refresh-token")
                .expiresIn(900)
                .build();
    }

    public void logout(String userId, boolean allDevices) {
        // Placeholder implementation for now.
    }
}
