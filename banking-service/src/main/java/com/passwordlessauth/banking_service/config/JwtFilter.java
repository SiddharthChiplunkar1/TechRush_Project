package com.passwordlessauth.banking_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.passwordlessauth.banking_service.dto.BankingPrincipal;
import com.passwordlessauth.banking_service.enums.AuthLevel;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

/**
 * JWT filter for the banking service.
 * Validates access tokens issued by auth-service using the shared secret.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    // Paths that don't need a JWT
    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/banking/health",
            "/banking/health"
    );

    private final JwtConfig jwtConfig;
    

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_PATHS.contains(path)
                || path.startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            SecretKey key;
            {
                byte[] secretBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
                if (secretBytes.length < 32) {
                    byte[] padded = new byte[32];
                    System.arraycopy(secretBytes, 0, padded, 0, secretBytes.length);
                    secretBytes = padded;
                }
                key = Keys.hmacShaKeyFor(secretBytes);
            }

            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.get("userId", String.class);
            String email  = claims.getSubject();
            String role   = claims.get("role", String.class);
            AuthLevel authLevel=AuthLevel.valueOf(claims.get("authLevel",String.class));
            BankingPrincipal principal=new BankingPrincipal(userId,email,role,authLevel);
            var auth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT in banking-service: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        } catch (JwtException ex) {
            log.warn("Invalid JWT in banking-service: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
