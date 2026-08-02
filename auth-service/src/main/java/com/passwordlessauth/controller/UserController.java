package com.passwordlessauth.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.requests.FaceEnrollRequest;
import com.passwordlessauth.dto.requests.UpdateProfileRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.LoginHistoryResponse;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.LoginHistoryService;
import com.passwordlessauth.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LoginHistoryService loginHistoryService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getUserProfile(userPrincipal.getUserId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile updated successfully",
                userService.updateProfile(userPrincipal.getUserId(), request)));
    }

    @PostMapping("/me/face-enroll")
    public ResponseEntity<ApiResponse<Void>> enrollFace(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FaceEnrollRequest request) {
        userService.enrollFaceId(userPrincipal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Face ID enrolled successfully"));
    }

    @DeleteMapping("/me/face-enroll")
    public ResponseEntity<ApiResponse<Void>> unenrollFace(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        userService.unenrollFaceId(userPrincipal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Face ID removed successfully"));
    }

    @GetMapping("/me/login-history")
    public ResponseEntity<ApiResponse<Page<LoginHistoryResponse>>> getLoginHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                loginHistoryService.getLoginHistoryDtos(
                        userPrincipal.getUserId(), PageRequest.of(page, size))));
    }
}
