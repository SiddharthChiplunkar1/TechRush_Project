package com.passwordlessauth.banking.config;

import com.passwordlessauth.banking.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtFilter.class);

    private static final String BEARER_PREFIX = "Bearer ";

    private static final String USER_ID_CLAIM = "userId";
    private static final String ROLE_CLAIM = "role";
    private static final String AUTH_LEVEL_CLAIM = "authLevel";

    private static final int MAX_TOKEN_LENGTH = 8192;

    private final SecretKey jwtSecretKey;
    private final JwtConfig jwtConfig;

    public JwtFilter(SecretKey jwtSecretKey, JwtConfig jwtConfig) {
        this.jwtSecretKey = jwtSecretKey;
        this.jwtConfig = jwtConfig;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        /*
         * If Spring Security has already established an authentication,
         * do not replace it.
         */
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader =
                request.getHeader("Authorization");

        /*
         * No Authorization header is not itself an error.
         *
         * Public endpoints may legitimately have no JWT.
         * SecurityConfig determines whether the requested endpoint
         * actually requires authentication.
         */
        if (authorizationHeader == null ||
                authorizationHeader.isBlank()) {

            filterChain.doFilter(request, response);
            return;
        }

        /*
         * An Authorization header exists, but it isn't a Bearer token.
         * Do not attempt to interpret it as authentication.
         */
        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {

            log.debug(
                    "Ignoring unsupported Authorization scheme for {}",
                    request.getMethod()
            );

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authorizationHeader.substring(
                        BEARER_PREFIX.length()
                ).trim();

        /*
         * Never process an empty or excessively large token.
         */
        if (token.isEmpty()) {

            log.debug("Received empty Bearer token");

            filterChain.doFilter(request, response);
            return;
        }

        if (token.length() > MAX_TOKEN_LENGTH) {

            log.warn(
                    "Rejected oversized JWT token"
            );

            filterChain.doFilter(request, response);
            return;
        }

        try {

            var parserBuilder = Jwts.parser().verifyWith(jwtSecretKey);
            if (jwtConfig != null && jwtConfig.getIssuer() != null && !jwtConfig.getIssuer().isBlank()) {
                parserBuilder.requireIssuer(jwtConfig.getIssuer());
            }
            if (jwtConfig != null && jwtConfig.getAudience() != null && !jwtConfig.getAudience().isBlank()) {
                parserBuilder.requireAudience(jwtConfig.getAudience());
            }

            Claims claims = parserBuilder
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String subject =
                    claims.getSubject();

            String userId =
                    claims.get(USER_ID_CLAIM, String.class);

            String role =
                    claims.get(ROLE_CLAIM, String.class);

            String authLevel =
                    claims.get(AUTH_LEVEL_CLAIM, String.class);

            /*
             * The Banking Service requires a stable authenticated
             * identity and role.
             */
            if (!isValidClaim(subject) ||
                    !isValidClaim(userId) ||
                    !isValidClaim(role)) {

                log.warn(
                        "Rejected JWT because required claims are missing or invalid"
                );

                filterChain.doFilter(request, response);
                return;
            }

            String normalizedRole =
                    normalizeRole(role);

            if (normalizedRole == null) {

                log.warn(
                        "Rejected JWT because role claim is invalid"
                );

                filterChain.doFilter(request, response);
                return;
            }

            /*
             * authLevel is optional for backwards compatibility.
             *
             * If present, reject an obviously malformed value rather
             * than allowing arbitrary oversized claim data into the
             * security context.
             */
            if (authLevel != null &&
                    authLevel.length() > 64) {

                log.warn(
                        "Rejected JWT because authLevel claim is invalid"
                );

                filterChain.doFilter(request, response);
                return;
            }

            AuthenticatedUser authenticatedUser =
                    new AuthenticatedUser(
                            userId,
                            subject,
                            normalizedRole,
                            authLevel
                    );

            List<SimpleGrantedAuthority> authorities =
                    List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + normalizedRole
                            )
                    );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            authenticatedUser,
                            null,
                            authorities
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            /*
             * Use a fresh SecurityContext when establishing
             * authentication for this request.
             */
            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            log.debug(
                    "JWT authentication established for authenticated principal"
            );

        } catch (JwtException ex) {

            /*
             * Do not expose or log parser details.
             *
             * The request remains unauthenticated and SecurityConfig
             * will decide whether that results in 401.
             */
            log.debug(
                    "JWT validation failed: {}",
                    ex.getClass().getSimpleName()
            );

        } catch (IllegalArgumentException ex) {

            /*
             * Covers invalid parser arguments / malformed values.
             */
            log.debug(
                    "JWT validation rejected malformed input"
            );

        } catch (RuntimeException ex) {

            /*
             * Unexpected authentication failures should not bring
             * down the request-processing thread.
             *
             * Do not expose internal exception information.
             */
            log.error(
                    "Unexpected JWT validation failure: {}",
                    ex.getClass().getSimpleName()
            );
        }

        /*
         * Invalid JWTs remain unauthenticated.
         *
         * SecurityConfig is responsible for returning 401 for
         * protected endpoints.
         */
        filterChain.doFilter(request, response);
    }

    private boolean isValidClaim(String value) {

        if (value == null || value.isBlank()) {
            return false;
        }

        /*
         * Prevent unreasonable claim sizes from entering the
         * application security context.
         */
        return value.length() <= 256;
    }

    /**
     * Converts a role claim into the format expected by Spring Security.
     *
     * Accepted:
     *   USER
     *   ADMIN
     *   ROLE_USER
     *   ROLE_ADMIN
     *
     * Internally we always store:
     *
     *   USER
     *   ADMIN
     *
     * so the authority becomes:
     *
     *   ROLE_USER
     *   ROLE_ADMIN
     */
    private String normalizeRole(String role) {

        String normalized =
                role.trim()
                        .toUpperCase(Locale.ROOT);

        if (normalized.startsWith("ROLE_")) {
            normalized =
                    normalized.substring("ROLE_".length());
        }

        if (normalized.isBlank()) {
            return null;
        }

        /*
         * Role names should contain only predictable characters.
         *
         * This prevents strange values from being converted into
         * Spring Security authorities.
         */
        if (!normalized.matches("[A-Z][A-Z0-9_]{0,63}")) {
            return null;
        }

        return normalized;
    }
}