package com.passwordlessauth.client;

import java.util.List;

import com.passwordlessauth.exception.FaceVerificationException;

public interface FaceIdClient {
    void enrollFace(String userId, List<String> frames) throws FaceVerificationException;
    FaceVerifyResult verifyFace(String userId, String imageBase64) throws FaceVerificationException;
    FaceVerifyResult verifyLive(String userId, List<String> frames) throws FaceVerificationException;
}
