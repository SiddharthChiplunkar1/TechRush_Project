package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.StepUpChallengeResponse;
import com.passwordlessauth.banking.client.UserResolverClient;
import com.passwordlessauth.banking.entity.StepUpChallenge;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import com.passwordlessauth.banking.service.StepUpChallengeService;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/banking/step-up")
public class StepUpController {

    private final StepUpChallengeService stepUpChallengeService;
    private final UserResolverClient userResolverClient;

    public StepUpController(StepUpChallengeService stepUpChallengeService, UserResolverClient userResolverClient) {
        this.stepUpChallengeService = stepUpChallengeService;
        this.userResolverClient = userResolverClient;
    }

    @PostMapping("/challenges/{challengeId}/verify")
    public ResponseEntity<StepUpChallengeResponse> verifyChallenge(
            @PathVariable String challengeId,
            @Valid @RequestBody StepUpOtpRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        userResolverClient.verifyTransferOtp(user.userId(), request.otp());
        StepUpChallenge challenge = stepUpChallengeService.verifyChallenge(
                challengeId,
                user.userId()
        );
        return ResponseEntity.ok(toResponse(challenge));
    }

    public record StepUpOtpRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(min = 6, max = 6)
            String otp) {
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
