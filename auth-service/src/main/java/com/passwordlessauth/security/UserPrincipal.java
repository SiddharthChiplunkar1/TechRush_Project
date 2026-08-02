package com.passwordlessauth.security;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.passwordlessauth.entity.User;
import com.passwordlessauth.enums.AuthLevel;

import java.util.Collection;
import java.util.List;

/**
 * Custom Spring Security principal populated from JWT claims after token validation.
 *
 * Why a custom principal instead of Spring's default UserDetails?
 * - We need to carry additional context (userId, authLevel) into the security context
 *   so that controllers can access it without an extra DB round-trip.
 * - Avoids coupling controllers to the security context string parsing.
 */
@Getter
@Builder
public class UserPrincipal implements UserDetails {

    private final String userId;
    private final String email;
    private final String role;
    private final AuthLevel authLevel;
    private final int tokenVersion;

    /**
     * Factory method to build a UserPrincipal from a fully-loaded User entity.
     * Used by the OTP/face/Google login paths where we load the User from DB.
     */
    public static UserPrincipal from(User user, AuthLevel authLevel) {
        return UserPrincipal.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .authLevel(authLevel)
                .tokenVersion(user.getTokenVersion())
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    /** No passwords in passwordless auth — return empty string. */
    @Override
    public String getPassword() {
        return "";
    }

    /** Spring Security's 'username' is the user's email in our system. */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
