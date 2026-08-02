package com.passwordlessauth.client;

import com.passwordlessauth.exception.GoogleAuthException;

/**
 * Verifies a user's Google identity as part of the passwordless "Sign in with Google" flow.
 */
public interface GoogleOAuthClient {

    /**
     * Exchanges an OAuth 2.0 authorization code for tokens with Google, then verifies
     * the returned ID token's signature, issuer, audience, and expiry.
     *
     * @param authorizationCode the one-time code returned by Google's consent screen
     * @param redirectUri       the redirect URI used in the original authorization request
     *                          (must match exactly what was registered with Google)
     * @return verified identity claims for the Google account
     * @throws GoogleAuthException if the exchange fails or the ID token is invalid
     */
    GoogleUserInfo exchangeAuthorizationCode(String authorizationCode, String redirectUri);
}
