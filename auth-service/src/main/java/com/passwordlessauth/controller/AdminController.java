package com.passwordlessauth.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_STATS_WINDOW_HOURS = 168;

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page must be >= 0")
            int page,

            @RequestParam(defaultValue = "20")
            @Min(value = 1, message = "Page size must be >= 1")
            @Max(
                    value = MAX_PAGE_SIZE,
                    message = "Page size must not exceed 100"
            )
            int size
    ) {
        PageRequest pageRequest =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<UserResponse> users =
                adminService.listUsers(pageRequest);

        return ResponseEntity.ok(
                ApiResponse.success(users)
        );
    }

    @GetMapping("/users/locked")
    public ResponseEntity<ApiResponse<List<UserResponse>>>
    getLockedUsers() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getLockedUsers()
                )
        );
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<UserResponse>>
    unlockUser(
            @PathVariable
            String userId
    ) {
        UserResponse user =
                adminService.unlockUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Account unlocked",
                        user
                )
        );
    }

    @PostMapping("/users/{userId}/revoke-sessions")
    public ResponseEntity<ApiResponse<Void>>
    revokeSessions(
            @PathVariable
            String userId
    ) {
        adminService.revokeAllSessions(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All sessions revoked"
                )
        );
    }

    @GetMapping("/stats/login-methods")
    public ResponseEntity<ApiResponse<Map<String, Long>>>
    loginMethodStats() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getLoginMethodStats()
                )
        );
    }

    @GetMapping("/stats/failed-logins")
    public ResponseEntity<ApiResponse<Long>>
    failedLoginCount(
            @RequestParam(defaultValue = "1")
            @Min(
                    value = 1,
                    message = "Hours must be >= 1"
            )
            @Max(
                    value = MAX_STATS_WINDOW_HOURS,
                    message = "Statistics window must not exceed 168 hours"
            )
            int hours
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getFailedLoginCount(hours)
                )
        );
    }

    @GetMapping("/stats/new-users")
    public ResponseEntity<ApiResponse<Long>>
    newUserCount() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getNewUserCount()
                )
        );
    }

    @GetMapping("/users/{userId}/sessions")
    public ResponseEntity<ApiResponse<Long>>
    activeSessions(
            @PathVariable
            String userId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getActiveSessionCount(userId)
                )
        );
    }
}