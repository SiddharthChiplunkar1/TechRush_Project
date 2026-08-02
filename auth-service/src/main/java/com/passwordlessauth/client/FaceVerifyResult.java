package com.passwordlessauth.client;

import lombok.Data;


@Data
public class FaceVerifyResult {
    private boolean matched;
    private double confidence;
    private boolean live;
    private String error;
}
