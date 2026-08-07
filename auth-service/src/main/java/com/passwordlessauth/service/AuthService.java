@@
     @Transactional
     public LoginResponse sendOtp(OtpRequest request) {
-        User user = userRepository.findByEmail(request.getEmail())
-                .orElseGet(() -> {
-                    User newUser = new User();
-                    newUser.setEmail(request.getEmail());
-                    return userRepository.save(newUser);
-                });
+        User user = userRepository.findByEmail(request.getEmail())
+                .orElseThrow(() -> new UserNotFoundException("User not found. Please register first."));
@@
     @Transactional
     public JwtResponse googleLogin(GoogleLoginRequest request, HttpServletRequest httpRequest) {
         // Server-to-server code exchange — client never handles the ID token directly
         GoogleUserInfo googleUser = googleOAuthClient.exchangeAuthorizationCode(
                 request.getAuthorizationCode(), request.getRedirectUri());
 
         if (!googleUser.emailVerified()) {
             throw new GoogleAuthException("Google account email is not verified.");
         }
-
-        User user = userRepository.findByGoogleId(googleUser.googleId())
-                .or(() -> userRepository.findByEmail(googleUser.email()))
-                .orElseGet(() -> {
-                    User newUser = new User();
-                    newUser.setEmail(googleUser.email());
-                    newUser.setFirstName(googleUser.firstName());
-                    newUser.setLastName(googleUser.lastName());
-                    newUser.setGoogleId(googleUser.googleId());
-                    newUser.setEmailVerified(true);
-                    newUser.setRole(Role.USER);
-                    return userRepository.save(newUser);
-                });
-
-        if (user.getGoogleId() == null) {
-            user.setGoogleId(googleUser.googleId());
-        }
-        if (!user.isEmailVerified()) {
-            user.setEmailVerified(true);
-        }
+        // Do not auto-create users via Google login for this project - require registration first
+        User user = userRepository.findByGoogleId(googleUser.googleId())
+                .or(() -> userRepository.findByEmail(googleUser.email()))
+                .orElseThrow(() -> new UserNotFoundException("Account not found. Please register before using Google login."));
@@
     @Transactional
     public JwtResponse refreshToken(RefreshTokenRequest request) {
@@
         return generateTokensResponse(user, AuthLevel.STRONG, refreshToken.getDeviceId(), false);
     }
@@
     public void logout(String currentUserId, String deviceId, boolean allDevices) {
@@
-        loginHistoryService.recordLogin(
-                user, AuthMethod.OTP, LoginStatus.SUCCESS, RiskLevel.LOW, null, deviceId, "LOGOUT");
+        loginHistoryService.recordLogin(
+                user, AuthMethod.OTP, LoginStatus.SUCCESS, RiskLevel.LOW, null, deviceId, "LOGOUT");
     }
