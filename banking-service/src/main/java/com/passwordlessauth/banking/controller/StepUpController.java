package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.StepUpChallengeResponse;
import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import com.passwordlessauth.banking.service.StepUpChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/banking/step-up")
public class StepUpController {

    private final StepUpChallengeService stepUpChallengeService;

    public StepUpController(StepUpChallengeService stepUpChallengeService) {
        this.stepUpChallengeService = stepUpChallengeService;
    }

    @PostMapping("/challenges/{challengeId}/verify")
    public ResponseEntity<StepUpChallengeResponse> verifyChallenge(
            @PathVariable String challengeId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        StepUpChallenge challenge = stepUpChallengeService.verifyChallenge(
                challengeId,
                user.userId()
        );
        return ResponseEntity.ok(toResponse(challenge));
    }

    private StepUpChallengeResponse toResponse(StepUpChallenge challenge) {
        return new StepUpChallengeResponse(
                challenge.getChallengeId(),
                challenge.getTransactionId(),
                challenge.getStatus(),
                challenge.getRequiredAuthStrength(),
                challenge.getExpiresAt(),
                challenge.getVerifiedAt(),
                challenge.getConsumedAt()
        );
    }
}
