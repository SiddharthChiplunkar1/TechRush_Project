package com.passwordlessauth.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.passwordlessauth.exception.JwtExpiredException;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login/otp",
            "/api/auth/login/otp/verify",
            "/api/auth/login/face",
            "/api/auth/login/google",
            "/api/auth/refresh",
            "/actuator"
    );

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();

        try {
            Claims claims = jwtService.validateAndExtractClaims(token);
            UserPrincipal principal = jwtService.extractPrincipal(claims);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Authenticated user '{}' with authLevel '{}'",
                    principal.getEmail(), principal.getAuthLevel());

        } catch (JwtExpiredException ex) {
            log.debug("Expired JWT rejected: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("Invalid JWT rejected: {}", ex.getMessage());
        }

        chain.doFilter(request, response);
    }
}