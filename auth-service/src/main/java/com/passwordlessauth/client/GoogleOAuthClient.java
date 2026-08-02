package com.passwordlessauth.client;

public interface GoogleOAuthClient {
    GoogleUserInfo exchangeAuthorizationCode(String authorizationCode, String redirectUri);
}
