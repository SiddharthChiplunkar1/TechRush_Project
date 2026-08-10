package com.passwordlessauth.dto.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IdentifyResponse {
    /** Backend-selected next authentication operation; never supplied by the browser. */
    private String nextStep;
}
