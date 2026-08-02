package com.passwordlessauth.client;

import com.passwordlessauth.exception.FaceVerificationException;

public interface FaceIdClient {
    void enrollFace(String userId, String imageBase64) throws FaceVerificationException;
    FaceVerifyResult verifyFace(String userId, String imageBase64) throws FaceVerificationException;
}