package com.passwordlessauth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.dto.requests.FaceEnrollRequest;
import com.passwordlessauth.dto.requests.UpdateProfileRequest;
import com.passwordlessauth.dto.responses.UserResponse;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.exception.UserNotFoundException;
import com.passwordlessauth.repository.UserRepository;
import com.passwordlessauth.client.FaceIdClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FaceIdClient faceIdClient;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String userId) {
        User user = getUser(userId);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUser(userId);
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void enrollFaceId(String userId, FaceEnrollRequest request) {
        User user = getUser(userId);
        
        // Delegate to FaceID client to extract and store embedding
        faceIdClient.enrollFace(userId, request.getFaceImage());
        
        user.setFaceEnrolled(true);
        userRepository.save(user);
    }
    
    @Transactional
    public void unenrollFaceId(String userId) {
        User user = getUser(userId);
        user.setFaceEnrolled(false);
        userRepository.save(user);
        // Note: Real implementation might also tell FaceIdClient to delete embedding
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private UserResponse mapToResponse(User user) {
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
}
