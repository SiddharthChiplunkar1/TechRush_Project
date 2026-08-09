package com.passwordlessauth;

import com.passwordlessauth.controller.AuthController;
import com.passwordlessauth.dto.requests.OtpRequest;
import com.passwordlessauth.dto.requests.RefreshTokenRequest;
import com.passwordlessauth.dto.requests.RegisterRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.JwtResponse;
import com.passwordlessauth.dto.responses.LoginResponse;
import com.passwordlessauth.dto.responses.RegisterResponse;
import com.passwordlessauth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController controller;

    @Test
    void register_delegatesToAuthService_returnsSuccessResponse() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("alice@example.com");
        req.setFirstName("Alice");
        req.setLastName("Smith");

        RegisterResponse svcResponse = RegisterResponse.builder()
                .email("alice@example.com")
                .message("Registration successful. Please verify your email with the OTP sent.")
                .build();
        when(authService.register(req)).thenReturn(svcResponse);

        ResponseEntity<ApiResponse<RegisterResponse>> response = controller.register(req);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getEmail()).isEqualTo("alice@example.com");

        verify(authService).register(req);
    }

    @Test
    void requestOtp_delegatesToAuthService_returnsMessage() {
        OtpRequest req = new OtpRequest();
        req.setEmail("bob@example.com");

        when(authService.sendOtp(req))
                .thenReturn(LoginResponse.builder().message("OTP sent to your email address.").build());

        ResponseEntity<ApiResponse<LoginResponse>> response = controller.requestOtp(req);

        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getMessage()).contains("OTP sent");
        verify(authService).sendOtp(req);
    }

    @Test
    void refreshToken_responseIsWrappedInApiResponse() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("some-token");

        when(authService.refreshToken(req))
                .thenReturn(JwtResponse.builder()
                        .refreshToken("rotated-token")
                        .accessToken("access-token")
                        .expiresIn(900)
                        .build());

        ResponseEntity<ApiResponse<JwtResponse>> response = controller.refreshToken(req);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                .contains("refresh_token=");
    }
}
