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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = adminService.listUsers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/locked")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getLockedUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getLockedUsers()));
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Account unlocked", adminService.unlockUser(userId)));
    }

    @PostMapping("/users/{userId}/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>> revokeSessions(@PathVariable String userId) {
        adminService.revokeAllSessions(userId);
        return ResponseEntity.ok(ApiResponse.success("All sessions revoked for user " + userId));
    }

    @GetMapping("/stats/login-methods")
    public ResponseEntity<ApiResponse<Map<String, Long>>> loginMethodStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getLoginMethodStats()));
    }

    @GetMapping("/stats/failed-logins")
    public ResponseEntity<ApiResponse<Long>> failedLoginCount(
            @RequestParam(defaultValue = "1") int hours) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getFailedLoginCount(hours)));
    }

    @GetMapping("/stats/new-users")
    public ResponseEntity<ApiResponse<Long>> newUserCount() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getNewUserCount()));
    }

    @GetMapping("/users/{userId}/sessions")
    public ResponseEntity<ApiResponse<Long>> activeSessions(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getActiveSessionCount(userId)));
    }
}