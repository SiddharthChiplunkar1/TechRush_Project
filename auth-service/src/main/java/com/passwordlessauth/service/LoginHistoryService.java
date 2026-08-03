package com.passwordlessauth.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.dto.responses.LoginHistoryResponse;
import com.passwordlessauth.entity.LoginHistory;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.AuthMethod;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.enums.RiskLevel;
import com.passwordlessauth.repository.LoginHistoryRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional
    public void recordLogin(User user,
                            AuthMethod method,
                            LoginStatus status,
                            RiskLevel riskLevel,
                            HttpServletRequest request) {
        recordLogin(user, method, status, riskLevel, request, null, null);
    }

    @Transactional
    public void recordLogin(User user,
                            AuthMethod method,
                            LoginStatus status,
                            RiskLevel riskLevel,
                            HttpServletRequest request,
                            String deviceId,
                            String failureReason) {
        LoginHistory entry = new LoginHistory();
        entry.setUser(user);
        entry.setAuthMethod(method);
        entry.setStatus(status);
        entry.setRiskLevel(riskLevel);
        entry.setIpAddress(extractIp(request));
        entry.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
        entry.setDeviceId(deviceId);
        entry.setFailureReason(failureReason);

        loginHistoryRepository.save(entry);

        if (status == LoginStatus.FAILED || status == LoginStatus.SUSPICIOUS) {
            log.warn("Login {} for user {} via {} (risk: {}) from IP {}",
                    status, maskId(user.getUserId()), method, riskLevel, maskIp(extractIp(request)));
        }
    }

    @Transactional(readOnly = true)
    public Page<LoginHistoryResponse> getLoginHistoryDtos(String userId, Pageable pageable) {
        return loginHistoryRepository
                .findByUserUserIdOrderByTimestampDesc(userId, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<LoginHistory> getLoginHistory(String userId, Pageable pageable) {
        return loginHistoryRepository.findByUserUserIdOrderByTimestampDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getFailedLoginCount(String userId) {
        return loginHistoryRepository.countByUserUserIdAndStatus(userId, LoginStatus.FAILED);
    }

    private LoginHistoryResponse toDto(LoginHistory h) {
        return LoginHistoryResponse.builder()
                .loginId(h.getLoginId())
                .timestamp(h.getTimestamp())
                .method(h.getAuthMethod())
                .status(h.getStatus())
                .ipAddress(maskIp(h.getIpAddress()))
                .deviceInfo(h.getUserAgent())
                .riskLevel(h.getRiskLevel())
                .failureReason(h.getFailureReason())
                .build();
    }

    private String extractIp(HttpServletRequest request) {
        if (request == null) return null;
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }

    private String maskIp(String ip) {
        if (ip == null) return "unknown";
        String[] parts = ip.split("\\.");
        if (parts.length == 4) return parts[0] + "." + parts[1] + ".***." + "***";
        return "***";
    }
}