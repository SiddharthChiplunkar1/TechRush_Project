package com.passwordlessauth.client;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonAlias;


@Data
public class FaceVerifyResult {
    @JsonAlias("match")
    private boolean matched;
    private double confidence;
    private boolean live;
    private String error;
}
