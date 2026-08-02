package com.passwordlessauth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.passwordlessauth.dto.requests.FaceEnrollRequest;
import com.passwordlessauth.dto.requests.UpdateUserRequest;
import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.UserResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("isAuthenticated()")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(UserResponse.builder().build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(UserResponse.builder().build());
    }

    @PostMapping("/face/enroll")
    public ResponseEntity<ApiResponse<Void>> enrollFace(
            @Valid @RequestBody FaceEnrollRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Face enrollment received", null));
    }
}