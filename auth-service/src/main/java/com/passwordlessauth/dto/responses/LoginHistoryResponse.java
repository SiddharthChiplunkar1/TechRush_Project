package com.passwordlessauth.dto.responses;

import java.time.LocalDateTime;

import com.passwordlessauth.enums.AuthMethod;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.enums.RiskLevel;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginHistoryResponse {
    private String loginId;
    private LocalDateTime timestamp;
    private AuthMethod method;
    private LoginStatus status;
    private String deviceInfo;
    private String ipAddress;
    private RiskLevel riskLevel;
    private String failureReason;
}
