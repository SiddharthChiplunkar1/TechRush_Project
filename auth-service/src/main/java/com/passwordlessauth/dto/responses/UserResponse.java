package com.passwordlessauth.dto.responses;

import java.time.LocalDateTime;

import com.passwordlessauth.enums.Role;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean emailVerified;
    private boolean faceEnrolled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}