package com.passwordlessauth.config;

import java.io.IOException;
import java.util.Set;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
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

    /*
     * Only endpoints that genuinely do not require an access JWT
     * belong here.
     */
    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth/register",
            "/api/auth/login/otp/request",
            "/api/auth/login/otp/verify",
            "/api/auth/login/face",
            "/api/auth/login/google",
            "/api/auth/login/trusted-device",
            "/api/auth/refresh",
            "/actuator/health"
    );

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        String path = request.getRequestURI();

        /*
         * Do not blindly bypass every actuator endpoint.
         */
        if (PUBLIC_PATHS.contains(path)) {
            return true;
        }

        /*
         * Swagger should not be exposed in production.
         *
         * If you need Swagger locally, protect/enable it through
         * a development profile rather than globally bypassing JWT.
         */
        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        SecurityContextHolder.clearContext();

        String authHeader =
                request.getHeader("Authorization");

        /*
         * No Authorization header:
         * continue as anonymous and let Spring Security decide
         * whether the endpoint is public.
         */
        if (!StringUtils.hasText(authHeader)) {
            filterChain.doFilter(request, response);
            return;
        }

        /*
         * An Authorization header exists but isn't Bearer.
         * Don't interpret it as authentication.
         */
        if (!authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authHeader.substring(BEARER_PREFIX.length()).trim();

        /*
         * Empty Bearer token is invalid.
         */
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims =
                    jwtService.validateAndExtractClaims(token);

            UserPrincipal principal =
                    jwtService.extractPrincipal(claims);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } catch (JwtExpiredException ex) {

            log.warn(
                    "Expired JWT rejected for {}",
                    request.getRequestURI()
            );

            SecurityContextHolder.clearContext();

        } catch (JwtException ex) {

            log.warn(
                    "Invalid JWT rejected for {}",
                    request.getRequestURI()
            );

            SecurityContextHolder.clearContext();

        } catch (RuntimeException ex) {

            /*
             * Unexpected token parsing/claim failures must never
             * accidentally result in an authenticated request.
             */
            log.error(
                    "JWT authentication processing failed for {}",
                    request.getRequestURI()
            );

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}