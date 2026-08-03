package com.passwordlessauth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.LoginStatus;
import com.passwordlessauth.repository.LoginHistoryRepository;
import com.passwordlessauth.repository.RefreshTokenRepository;
import com.passwordlessauth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserResponse);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getLockedUsers() {
        return userRepository.findCurrentlyLockedUsers(LocalDateTime.now())
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse unlockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        log.info("Admin unlocked account for user {}", maskId(userId));
        return toUserResponse(user);
    }

    @Transactional
    public void revokeAllSessions(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setTokenVersion(user.getTokenVersion() + 1);
            userRepository.save(user);
        });
        refreshTokenRepository.revokeAllUserTokens(userId, "ADMIN_REVOKE", LocalDateTime.now());
        log.info("Admin revoked all sessions for user {}", maskId(userId));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getLoginMethodStats() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return loginHistoryRepository.getLoginMethodStats(since)
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }

    @Transactional(readOnly = true)
    public long getFailedLoginCount(int hours) {
        return loginHistoryRepository.countFailedLoginsAfter(
                LocalDateTime.now().minusHours(hours));
    }

    @Transactional(readOnly = true)
    public long getNewUserCount() {
        return userRepository.countUsersCreatedSince(LocalDateTime.now().minusHours(24));
    }

    @Transactional(readOnly = true)
    public long getActiveSessionCount(String userId) {
        return refreshTokenRepository.countActiveTokensByUser(userId);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .faceEnrolled(user.isFaceEnrolled())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private String maskId(String id) {
        if (id == null || id.length() < 4) return "***";
        return id.substring(0, 4) + "...";
    }
}
