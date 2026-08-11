package com.passwordlessauth.banking_service;

import com.passwordlessauth.banking.config.JwtConfig;
import com.passwordlessauth.banking.config.JwtFilter;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    private static final String SECRET_STRING = "dGVjaHJ1c2gtZGV2LXNlY3JldC1rZXktZm9yLWxvY2FsLWRldmVsb3BtZW50LW9ubHk=";
    private SecretKey secretKey;
    private JwtConfig jwtConfig;
    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        secretKey = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
        jwtConfig = new JwtConfig(SECRET_STRING, "TechRush", "techrush-app");
        jwtFilter = new JwtFilter(secretKey, jwtConfig);
    }

    @Test
    void validToken_authenticatesUser() throws Exception {
        String token = Jwts.builder()
                .subject("testuser@example.com")
                .claim("userId", "user-123")
                .claim("role", "USER")
                .claim("authLevel", "WEAK")
                .issuer("TechRush")
                .audience().add("techrush-app").and()
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(secretKey)
                .compact();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        jwtFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isInstanceOf(AuthenticatedUser.class);
        AuthenticatedUser user = (AuthenticatedUser) auth.getPrincipal();
        assertThat(user.userId()).isEqualTo("user-123");
        assertThat(user.email()).isEqualTo("testuser@example.com");
    }

    @Test
    void wrongIssuer_rejectsAuthentication() throws Exception {
        String token = Jwts.builder()
                .subject("testuser@example.com")
                .claim("userId", "user-123")
                .claim("role", "USER")
                .issuer("WrongIssuer")
                .audience().add("techrush-app").and()
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(secretKey)
                .compact();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        jwtFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void wrongAudience_rejectsAuthentication() throws Exception {
        String token = Jwts.builder()
                .subject("testuser@example.com")
                .claim("userId", "user-123")
                .claim("role", "USER")
                .issuer("TechRush")
                .audience().add("wrong-app").and()
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(secretKey)
                .compact();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        jwtFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void expiredToken_rejectsAuthentication() throws Exception {
        String token = Jwts.builder()
                .subject("testuser@example.com")
                .claim("userId", "user-123")
                .claim("role", "USER")
                .issuer("TechRush")
                .audience().add("techrush-app").and()
                .expiration(new Date(System.currentTimeMillis() - 10000))
                .signWith(secretKey)
                .compact();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        jwtFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void invalidSignature_rejectsAuthentication() throws Exception {
        SecretKey wrongKey = Keys.hmacShaKeyFor("different-secret-key-that-is-at-least-32-bytes-long!".getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject("testuser@example.com")
                .claim("userId", "user-123")
                .claim("role", "USER")
                .issuer("TechRush")
                .audience().add("techrush-app").and()
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(wrongKey)
                .compact();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

        jwtFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
