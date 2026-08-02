package com.passwordlessauth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.service.AdminService;

import lombok.RequiredArgsConstructor;

/**
 * Admin-only endpoints.
 * Access is double-gated: SecurityConfig restricts {@code /api/admin/**} to
 * {@code ROLE_ADMIN}, and each method also carries a {@code @PreAuthorize}
 * annotation for defence-in-depth.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ─── User Management ─────────────────────────────────────────────────────

    /**
     * Paginated list of all users.
     * Sorted by createdAt descending by default.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = adminService.listUsers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * All users whose accounts are currently locked.
     */
    @GetMapping("/users/locked")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getLockedUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getLockedUsers()));
    }

    /**
     * Manually unlock a user account (e.g. after verifying identity out-of-band).
     */
    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account unlocked", adminService.unlockUser(userId)));
    }

    /**
     * Force-revoke all active sessions for a user.
     * Use during security incidents (compromised account, suspicious activity).
     */
    @PostMapping("/users/{userId}/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>> revokeSessions(@PathVariable String userId) {
        adminService.revokeAllSessions(userId);
        return ResponseEntity.ok(ApiResponse.success("All sessions revoked for user " + userId));
    }

    // ─── Statistics & Monitoring ──────────────────────────────────────────────

    /**
     * Login method distribution for the last 24 hours.
     * Returns a map of {@code "OTP" -> count, "GOOGLE_OAUTH" -> count, ...}
     */
    @GetMapping("/stats/login-methods")
    public ResponseEntity<ApiResponse<Map<String, Long>>> loginMethodStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getLoginMethodStats()));
    }

    /**
     * Count of failed logins in a rolling window.
     * A sudden spike suggests a brute-force or credential-stuffing attack.
     *
     * @param hours rolling window in hours (default 1)
     */
    @GetMapping("/stats/failed-logins")
    public ResponseEntity<ApiResponse<Long>> failedLoginCount(
            @RequestParam(defaultValue = "1") int hours) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getFailedLoginCount(hours)));
    }

    /**
     * New registrations in the last 24 hours.
     */
    @GetMapping("/stats/new-users")
    public ResponseEntity<ApiResponse<Long>> newUserCount() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getNewUserCount()));
    }

    /**
     * Active (non-revoked) session count for a specific user.
     */
    @GetMapping("/users/{userId}/sessions")
    public ResponseEntity<ApiResponse<Long>> activeSessions(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getActiveSessionCount(userId)));
    }
}
