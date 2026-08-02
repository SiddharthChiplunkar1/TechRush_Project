package com.passwordlessauth.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.passwordlessauth.config.JwtConfig;

@Service
public class JwtService {

    private final JwtConfig jwtConfig;

    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    public String generateAccessToken(UserDetails userDetails) {
        return "stub-access-token";
    }

    public Object validateToken(String token) {
        return null;
    }
}